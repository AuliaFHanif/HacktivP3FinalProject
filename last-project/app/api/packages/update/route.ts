import { NextResponse } from "next/server";
import PackageModel from "@/db/models/PackageModels";

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    
    const id = formData.get("id")?.toString();
    const name = formData.get("name")?.toString();
    const type = formData.get("type")?.toString();
    const tokens = formData.get("tokens")?.toString();
    const price = formData.get("price")?.toString();
    const description = formData.get("description")?.toString();
    const featuresStr = formData.get("features")?.toString();
    const popularStr = formData.get("popular")?.toString();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Package ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (name) updateData.name = name;
    if (type) updateData.type = type;
    if (tokens) {
      const tokensNum = parseInt(tokens, 10);
      if (isNaN(tokensNum)) {
        return NextResponse.json(
          { success: false, error: "Tokens must be a valid number" },
          { status: 400 }
        );
      }
      updateData.tokens = tokensNum;
    }
    if (price) {
      const priceNum = parseInt(price, 10);
      if (isNaN(priceNum)) {
        return NextResponse.json(
          { success: false, error: "Price must be a valid number" },
          { status: 400 }
        );
      }
      updateData.price = priceNum;
    }
    if (description) updateData.description = description;
    if (featuresStr) {
      const features = featuresStr.split(",").map(f => f.trim()).filter(f => f.length > 0);
      if (features.length === 0) {
        return NextResponse.json(
          { success: false, error: "At least one feature is required" },
          { status: 400 }
        );
      }
      updateData.features = features;
    }
    if (popularStr !== undefined) {
      updateData.popular = popularStr === "true";
    }

    const updatedPackage = await PackageModel.updatePackage(id, updateData);

    if (!updatedPackage) {
      return NextResponse.json(
        { success: false, error: "Package not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Package updated successfully",
        data: {
          ...updatedPackage,
          _id: updatedPackage._id?.toString()
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update package error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update package",
      },
      { status: 500 }
    );
  }
}