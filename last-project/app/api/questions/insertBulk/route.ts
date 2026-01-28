import QuestionModel from "@/db/models/QuestionModels";
import CategoryModel from "@/db/models/CategoryModels";
import { NextResponse } from "next/server";

async function updateCategoryLevelIfReady(categoryID: string, level: string) {
	try {
		// Convert level names to match category schema (middle instead of mid)
		const categoryLevelKey = level === "mid" ? "middle" : level;
		
		// Count questions for this category and level
		const count = await QuestionModel.countQuestionsByCategoryAndLevel(categoryID, level);
		
		// If there are at least 15 questions, update category level
		if (count >= 15) {
			const category = await CategoryModel.getCategoryById(categoryID);
			if (category) {
				const updatedLevel = {
					...category.level,
					[categoryLevelKey]: true
				};
				await CategoryModel.updateCategory(categoryID, { level: updatedLevel });
				console.log(`Category ${categoryID} level ${level} marked as ready (${count} questions found)`);
			}
		}
	} catch (error) {
		console.error(`Error updating category level: ${error instanceof Error ? error.message : 'Unknown error'}`);
		// Don't throw - this is a non-critical operation
	}
}

export async function POST(request: Request) {
	try {
		const contentType = request.headers.get("content-type") || "";
		let questions: unknown[] = [];

		if (contentType.includes("application/x-www-form-urlencoded")) {
			const formData = await request.formData();
			const questionsStr = formData.get("questions")?.toString();
			if (questionsStr) {
				try {
					questions = JSON.parse(questionsStr);
				} catch {
					questions = [];
				}
			}
		} else {
			const body = await request.json();
			questions = body?.questions || [];
		}

		if (!Array.isArray(questions) || questions.length === 0) {
			return NextResponse.json(
				{ success: false, error: "No questions provided" },
				{ status: 400 }
			);
		}

		const created = [];
		const errors: Array<{ index: number; error: string; question: unknown }> = [];

		for (let i = 0; i < questions.length; i++) {
			const q = questions[i];
			try {
				const question = await QuestionModel.createQuestion(
					q.categoryID,
					q.level,
					q.type,
					q.content,
					Boolean(q.followUp),
					q.audioUrl
				);
				created.push(question);
			} catch (err) {
				errors.push({
					index: i,
					error: err instanceof Error ? err.message : "Unknown error",
					question: q,
				});
			}
		}

		// After inserting, check if any categories need their levels updated
		if (created.length > 0) {
			// Get unique category ID and level combinations
			const categoryLevelSet = new Set<string>();
			for (const question of created) {
				if (question.categoryID) {
					categoryLevelSet.add(`${question.categoryID}:${question.level}`);
				}
			}

			// Check each combination and update category if needed
			for (const combo of categoryLevelSet) {
				const [categoryID, level] = combo.split(":");
				await updateCategoryLevelIfReady(categoryID, level);
			}
		}

		return NextResponse.json(
			{
				success: errors.length === 0,
				inserted: created.length,
				total: questions.length,
				questions: created,
				errors: errors.length ? errors : undefined,
			},
			{ status: errors.length ? 207 : 201 }
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json({ success: false, error: message }, { status: 400 });
	}
}
