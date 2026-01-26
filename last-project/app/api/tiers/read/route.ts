import TierModel from "@/db/models/TierModels";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const tiers = await TierModel.getTiers();
        
        const serializedTiers = tiers.map(tier => ({
            ...tier,
            _id: tier._id?.toString()
        }));
        
        return NextResponse.json(
            { success: true, data: serializedTiers },
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