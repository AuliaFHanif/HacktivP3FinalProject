import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import UserModel from "@/db/models/UserModels";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let email = "";
    let password = "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      email = formData.get("email")?.toString() || "";
      password = formData.get("password")?.toString() || "";
    } else {
      const body = await request.json();
      email = body?.email || "";
      password = body?.password || "";
    }

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await UserModel.getUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const access_token = sign(
      { email: user.email, id: user._id?.toString(), name: user.name, role: user.role, token: user.token },
      process.env.JWT_SECRET || "secret"
    );

    return NextResponse.json({ success: true, access_token });
  } catch (error) {
    return NextResponse.json(
      { message: "Hashing failed" },
      { status: 500 }
    );
  }
}