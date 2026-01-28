import QuestionModel from "@/db/models/QuestionModels";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const questions = await QuestionModel.getQuestions();
    
        
        return NextResponse.json(
            { questions },
            { status: 200 }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}