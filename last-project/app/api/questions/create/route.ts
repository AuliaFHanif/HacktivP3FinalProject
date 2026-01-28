import QuestionModel from "@/db/models/QuestionModels";
import CategoryModel from "@/db/models/CategoryModels";
import { NextResponse } from "next/server";

async function updateCategoryLevelIfReady(categoryId: string, level: string) {
	try {
		// Convert level names to match category schema (middle instead of mid)
		const categoryLevelKey = level === "mid" ? "middle" : level;
		
		// Count questions for this category and level
		const count = await QuestionModel.countQuestionsByCategoryAndLevel(categoryId, level);
		
		// If there are at least 15 questions, update category level
		if (count >= 15) {
			const category = await CategoryModel.getCategoryById(categoryId);
			if (category) {
				const updatedLevel = {
					...category.level,
					[categoryLevelKey]: true
				};
				await CategoryModel.updateCategory(categoryId, { level: updatedLevel });
				console.log(`Category ${categoryId} level ${level} marked as ready (${count} questions found)`);
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
        let categoryId = "";
        let level = "";
        let type = "";
        let content = "";
        let followUp = false;
        let audioUrl = null;

        if (contentType.includes("application/x-www-form-urlencoded")) {
            const formData = await request.formData();
            categoryId = formData.get("categoryId")?.toString() || "";
            level = formData.get("level")?.toString() || "";
            type = formData.get("type")?.toString() || "";
            content = formData.get("content")?.toString() || "";
            followUp = formData.get("followUp")?.toString() === "true" || false;
            audioUrl = formData.get("audioUrl")?.toString() || "";
        } else {
            const body = await request.json();
            categoryId = body?.categoryId || "";
            level = body?.level || "";
            type = body?.type || "";
            content = body?.content || "";
            followUp = body?.followUp || false;
            audioUrl = body?.audioUrl || "";
        }

        if (!categoryId || !level || !type || !content) {
            return NextResponse.json(
                { message: "Missing required fields: categoryId, level, type, content" },
                { status: 400 }
            );
        }

        await QuestionModel.createQuestion(categoryId, level, type, content, Boolean(followUp), audioUrl);

        // Check if category level should be marked as ready
        await updateCategoryLevelIfReady(categoryId, level);

        return NextResponse.json({ message: "Question created successfully!" }, { status: 201 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ message }, { status: 400 });
    }
}