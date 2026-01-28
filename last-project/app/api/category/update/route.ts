import CategoryModel from "@/db/models/CategoryModels";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
    try {
        const formData = await request.formData();
        const id = formData.get("id") as string;
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const imgUrl = formData.get("imgUrl") as string;
        const levelStr = formData.get("level") as string;
        const publishedStr = formData.get("published") as string;

        const updateData: Record<string, any> = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (imgUrl) updateData.imgUrl = imgUrl;
        if (levelStr) updateData.level = JSON.parse(levelStr);
        if (publishedStr) updateData.published = publishedStr === "true";

        await CategoryModel.updateCategory(id, updateData);
        return NextResponse.json(
            { message: `Category with ID '${id}' updated successfully!` },
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