import CategoryModel from "@/db/models/CategoryModels";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const imgUrl = formData.get("imgUrl") as string;
        const levelStr = formData.get("level") as string;
        const publishedStr = formData.get("published") as string;

        const level = levelStr ? JSON.parse(levelStr) : { junior: false, middle: false, senior: false };
        const published = publishedStr === "true";

        await CategoryModel.createCategory(title, description, imgUrl, level, published);
        return NextResponse.json(
            { message: `Category '${title}' created successfully!` },
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