import QuestionModel from "@/db/models/QuestionModels";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
    try {
        const formData = await request.formData();
        const id = formData.get("id") as string;
        
        if (!id) {
            return NextResponse.json(
                { message: "Question ID is required for deletion." },
                { status: 400 }
            );
        }
        
        await QuestionModel.deleteQuestion(id);
        return NextResponse.json(
            { message: `Question with ID '${id}' deleted successfully!` },
            { status: 200 }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { message: message },
            { status: 400 }
        );
    }
}