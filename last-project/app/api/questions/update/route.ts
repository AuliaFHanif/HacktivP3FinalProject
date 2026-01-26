import QuestionModel from "@/db/models/QuestionModels";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, level, type, content, followUp, audioUrl } = body ?? {};

        if (!id) {
            return NextResponse.json(
                { success: false, message: "Missing required field: id" },
                { status: 400 }
            );
        }

        const updateData: Record<string, unknown> = {};
        if (level) updateData.level = level;
        if (type) updateData.type = type;
        if (content) updateData.content = content;
        if (followUp !== undefined) updateData.followUp = Boolean(followUp);
        if (audioUrl) updateData.audioUrl = audioUrl;

        await QuestionModel.updateQuestion(id, updateData);
        return NextResponse.json(
            { success: true, message: `Question with ID '${id}' updated successfully!` },
            { status: 200 }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ success: false, message }, { status: 400 });
    }
}