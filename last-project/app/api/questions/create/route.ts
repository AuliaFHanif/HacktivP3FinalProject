import QuestionModel from "@/db/models/QuestionModels";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { categoryID, level, type, content, followUp = false, audioUrl } = body ?? {};

        if (!categoryID || !level || !type || !content) {
            return NextResponse.json(
                { success: false, message: "Missing required fields: categoryID, level, type, content" },
                { status: 400 }
            );
        }

        await QuestionModel.createQuestion(categoryID, level, type, content, Boolean(followUp), audioUrl);

        return NextResponse.json({ success: true, message: "Question created successfully!" }, { status: 201 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ success: false, message }, { status: 400 });
    }
}