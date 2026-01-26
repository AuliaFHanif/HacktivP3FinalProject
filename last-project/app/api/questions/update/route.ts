import QuestionModel from "@/db/models/QuestionModels";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
    try {
        const formData = await request.formData();
        const id = formData.get("id") as string;
        const level = formData.get("level") as string | null;
        const type = formData.get("type") as string | null;
        const content = formData.get("content") as string | null;
        const followUp = formData.get("followUp") as string | null;
        const audioUrl = formData.get("audioUrl") as string | null;
        
        const updateData: Record<string, unknown> = {};
        if (level) updateData.level = level;
        if (type) updateData.type = type;
        if (content) updateData.content = content;
        if (followUp !== null) updateData.followUp = followUp === "true";
        if (audioUrl) updateData.audioUrl = audioUrl;
        
        await QuestionModel.updateQuestion(id, updateData);
        return NextResponse.json(
            { message: `Question with ID '${id}' updated successfully!` },
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