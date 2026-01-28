import QuestionModel from "@/db/models/QuestionModels";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
    try {
        const contentType = request.headers.get("content-type") || "";
        let id = "";
        let level = "";
        let type = "";
        let content = "";
        let followUp: boolean | string = "";
        let audioUrl = "";

        if (contentType.includes("application/x-www-form-urlencoded")) {
            const formData = await request.formData();
            id = formData.get("id")?.toString() || "";
            level = formData.get("level")?.toString() || "";
            type = formData.get("type")?.toString() || "";
            content = formData.get("content")?.toString() || "";
            followUp = formData.get("followUp")?.toString() || "";
            audioUrl = formData.get("audioUrl")?.toString() || "";
        } else {
            const body = await request.json();
            id = body?.id || "";
            level = body?.level || "";
            type = body?.type || "";
            content = body?.content || "";
            followUp = body?.followUp || "";
            audioUrl = body?.audioUrl || "";
        }

        if (!id) {
            return NextResponse.json(
                { message: "Missing required field: id" },
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
            { message: `Question with ID '${id}' updated successfully!` },
            { status: 200 }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ message }, { status: 400 });
    }
}