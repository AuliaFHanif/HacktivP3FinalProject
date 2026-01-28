import CategoryModel from "@/db/models/CategoryModels";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const categories = await CategoryModel.getCategories();
        
        return NextResponse.json(
            { categories },
            { status: 200 }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { message: message },
            { status: 500 }
        );
    }
}