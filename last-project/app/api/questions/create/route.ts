import QuestionModel from "@/db/models/QuestionModels";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const categoryId = formData.get("categoryId") as string;
        const level = formData.get("level") as string;
        const type = formData.get("type") as string;
        const content = formData.get("content") as string;
        const followUp = formData.get("followUp") as string;
        const audioUrl = formData.get("audioUrl") as string | undefined;
        
        await QuestionModel.createQuestion(categoryId, level, type, content, followUp === "true", audioUrl);
        return NextResponse.json(
            { message: "Question created successfully!" },
            { status: 201 }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { message: message },
            { status: 400 }
        );
    }
}