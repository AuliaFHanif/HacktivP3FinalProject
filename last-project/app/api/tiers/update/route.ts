import TierModel from "@/db/models/TierModels";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
    try {
        const formData = await request.formData();
        const id = formData.get("id") as string;
        const title = formData.get("title") as string | null;
        const price = formData.get("price") as string | null;
        const benefits = formData.get("benefits") as string | null;
        const quota = formData.get("quota") as string | null;
        const description = formData.get("description") as string | null;
        
        const updateData: Record<string, unknown> = {};
        if (title) updateData.title = title;
        if (price) updateData.price = Number(price);
        if (benefits) updateData.benefits = benefits.split(",");
        if (quota) updateData.quota = Number(quota);
        if (description) updateData.description = description;
        
        await TierModel.updateTier(id, updateData);
        return NextResponse.json(
            { message: `Tier with ID '${id}' updated successfully!` },
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