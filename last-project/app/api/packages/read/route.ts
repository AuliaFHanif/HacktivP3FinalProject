import { NextResponse } from "next/server";
import PackageModel from "@/db/models/PackageModels";

export async function GET() {
  try {
    const packages = await PackageModel.getPackages();

    // Serialize ObjectId to string for JSON response
    const serializedPackages = packages.map((pkg) => ({
      ...pkg,
      _id: pkg._id?.toString(),
    }));

    return NextResponse.json(
      { success: true, data: serializedPackages },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch packages error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch packages",
      },
      { status: 500 }
    );
  }
}