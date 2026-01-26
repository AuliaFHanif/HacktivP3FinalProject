import CategoryModel from "@/db/models/CategoryModels";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const imgUrl = formData.get("imgUrl") as string;

        await CategoryModel.createCategory(title, description, imgUrl);
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