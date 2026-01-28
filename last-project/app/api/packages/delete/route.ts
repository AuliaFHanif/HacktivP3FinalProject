import { NextResponse } from "next/server";
import PackageModel from "@/db/models/PackageModels";

export async function DELETE(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get("id")?.toString();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Package ID is required" },
        { status: 400 }
      );
    }

    const deleted = await PackageModel.deletePackage(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Package not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Package deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete package error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete package",
      },
      { status: 500 }
    );
  }
}