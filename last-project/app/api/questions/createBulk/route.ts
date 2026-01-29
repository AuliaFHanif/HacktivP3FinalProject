import QuestionModel from "@/db/models/QuestionModels";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface BulkQuestionInput {
  categoryId: string; // ObjectId string for the category
  level: string;
  type: string;
  count?: number; // Number of questions to generate, default 10
}

interface GeneratedQuestion {
  content: string;
  followUp: boolean;
}

const VALID_LEVELS = ["junior", "middle", "senior"];
const VALID_TYPES = ["intro", "core", "closing"];

export async function generateBulkQuestions(input: BulkQuestionInput) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Gemini API key is not configured.");
    }
    if (!input.categoryId || !input.level || !input.type) {
      throw new Error("Missing required fields: categoryId, level, type");
    }
    if (!VALID_LEVELS.includes(input.level)) {
        throw new Error(`Invalid level value. Must be one of: ${VALID_LEVELS.join(", ")}`);
    }
    if (!VALID_TYPES.includes(input.type)) {
        throw new Error(`Invalid type value. Must be one of: ${VALID_TYPES.join(", ")}`);
    }
    
  const { categoryId, level, type, count = 10 } = input;

  try {
    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Anda adalah seorang pewawancara ahli yang sedang menyusun pertanyaan wawancara teknis. Buatlah tepat ${count} pertanyaan wawancara yang unik berdasarkan parameter berikut.

Parameter:
- Level: ${level}
- Tipe: ${type}

Kembalikan HANYA dalam bentuk array JSON yang valid tanpa format markdown, blok kode, atau teks tambahan. Gunakan struktur persis seperti ini:
[
  {
    "content": "teks pertanyaan di sini",
    "followUp": true atau false
  }
]

Pastikan setiap pertanyaan unik, relevan dengan level dan tipe yang ditentukan, serta sesuai untuk wawancara teknis. Field followUp harus bernilai true jika pertanyaan tersebut dirancang untuk memiliki pertanyaan lanjutan.

Hasilkan ${count} pertanyaan sekarang:`;

    // Call Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseContent = response.text();
    
    if (!responseContent) {
      throw new Error("No response from Gemini");
    }

    // Parse the response
    let generatedQuestions: GeneratedQuestion[];
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = responseContent
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      
      generatedQuestions = JSON.parse(cleanedResponse);
    } catch (parseError) {
      throw new Error(`Failed to parse Gemini response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    // Validate we got the right number of questions
    if (!Array.isArray(generatedQuestions) || generatedQuestions.length !== count) {
      throw new Error(`Expected ${count} questions but got ${generatedQuestions?.length || 0}`);
    }

    // Return generated questions without inserting to database
    // Questions will be inserted later via insertBulk endpoint when user submits
    const questionsWithMetadata = generatedQuestions.map(q => ({
      categoryId,
      level,
      type,
      content: q.content,
      followUp: q.followUp,
    }));

    return {
      success: true,
      generated: questionsWithMetadata.length,
      total: count,
      questions: questionsWithMetadata,
    };

  } catch (error) {
    throw new Error(`Failed to generate bulk questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// API route handler
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let categoryId = "";
    let level = "";
    let type = "";
    let count = 10;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      categoryId = formData.get("categoryId")?.toString() || "";
      level = formData.get("level")?.toString() || "";
      type = formData.get("type")?.toString() || "";
      const countStr = formData.get("count")?.toString();
      count = countStr ? parseInt(countStr, 10) : 10;
    } else {
      const body = await request.json();
      categoryId = body?.categoryId || "";
      level = body?.level || "";
      type = body?.type || "";
      const countStr = body?.count;
      count = countStr ? parseInt(countStr, 10) : 10;
    }

    if (!categoryId || !level || !type) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: categoryId, level, type" },
        { status: 400 }
      );
    }

    const result = await generateBulkQuestions({
      categoryId,
      level,
      type,
      count,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}