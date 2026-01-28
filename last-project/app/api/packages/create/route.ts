import { NextResponse } from "next/server";
import PackageModel from "@/db/models/PackageModels";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const name = formData.get("name")?.toString();
    const type = formData.get("type")?.toString();
    const tokens = formData.get("tokens")?.toString();
    const price = formData.get("price")?.toString();
    const description = formData.get("description")?.toString();
    const featuresStr = formData.get("features")?.toString();
    const popularStr = formData.get("popular")?.toString();

    if (!name || !type || !tokens || !price || !description || !featuresStr) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // Parse features from comma-separated string
    const features = featuresStr.split(",").map(f => f.trim()).filter(f => f.length > 0);
    
    if (features.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one feature is required" },
        { status: 400 }
      );
    }

    const tokensNum = parseInt(tokens, 10);
    const priceNum = parseInt(price, 10);
    const popular = popularStr === "true";

    if (isNaN(tokensNum) || isNaN(priceNum)) {
      return NextResponse.json(
        { success: false, error: "Tokens and price must be valid numbers" },
        { status: 400 }
      );
    }

    const packageData = await PackageModel.createPackage(
      name,
      type,
      tokensNum,
      priceNum,
      description,
      features,
      popular
    );

    return NextResponse.json(
      {
        success: true,
        message: "Package created successfully",
        data: {
          ...packageData,
          _id: packageData._id?.toString()
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create package error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create package",
      },
      { status: 500 }
    );
  }
}