import QuestionModel from "@/db/models/QuestionModels";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { questions } = body ?? {};

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
