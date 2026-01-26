import TierModel from "@/db/models/TierModels";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const title = formData.get("title") as string;
        const price = Number(formData.get("price"));
        const benefits = (formData.get("benefits") as string).split(",");
        const quota = Number(formData.get("quota"));
        const description = formData.get("description") as string;
        
        await TierModel.createTier(title, price, benefits, quota, description);
        return NextResponse.json(
            { message: `Tier '${title}' created successfully!` },
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