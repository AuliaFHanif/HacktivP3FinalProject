import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import UserModel from "@/db/models/UserModels";


export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let email = "";
    let password = "";
    let name = "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      email = formData.get("email")?.toString() || "";
      password = formData.get("password")?.toString() || "";
      name = formData.get("name")?.toString() || "";
    } else {
      const body = await request.json();
      email = body?.email || "";
      password = body?.password || "";
      name = body?.name || "";
    }

    const role = "user";
    
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existingUser = await UserModel.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await UserModel.createUser(email, hashedPassword, name);

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { 
        message: "User registered successfully",
        user: userWithoutPassword 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {  
        message: error instanceof Error ? error.message : "Registration failed" 
      },
      { status: 500 }
    );
  }
}