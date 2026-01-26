import QuestionModel from "@/db/models/QuestionModels";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface BulkQuestionInput {
  categoryID: string; // ObjectId string for the category
  level: string;
  type: string;
  count?: number; // Number of questions to generate, default 10
}

interface GeneratedQuestion {
  content: string;
  followUp: boolean;
}

const VALID_LEVELS = ["junior", "mid", "senior"];
const VALID_TYPES = ["intro", "core", "closing"];

export async function generateBulkQuestions(input: BulkQuestionInput) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OpenAI API key is not configured.");
    }
    if (!input.categoryID || !input.level || !input.type) {
      throw new Error("Missing required fields: categoryID, level, type");
    }
    if (!VALID_LEVELS.includes(input.level)) {
        throw new Error(`Invalid level value. Must be one of: ${VALID_LEVELS.join(", ")}`);
    }
    if (!VALID_TYPES.includes(input.type)) {
        throw new Error(`Invalid type value. Must be one of: ${VALID_TYPES.join(", ")}`);
    }
    
  const { categoryID, level, type, count = 10 } = input;

  try {
    // Call OpenAI API to generate questions
    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        {
          role: "system",
          content: `You are an expert interviewer creating technical interview questions. Generate exactly ${count} unique interview questions based on the given parameters. Return ONLY a valid JSON array with no markdown formatting or code blocks.`,
        },
        {
          role: "user",
          content: `Generate ${count} interview questions with the following parameters:
- Level: ${level}
- Type: ${type}

Return a JSON array of objects with this exact structure:
[
  {
    "content": "question text here",
    "followUp": true or false
  }
]

Make sure each question is unique, relevant to the level and type specified, and appropriate for a technical interview. The followUp field should be true if the question is designed to have follow-up questions.`,
        },
      ],
    
    });

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error("No response from OpenAI");
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
      throw new Error(`Failed to parse OpenAI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    // Validate we got the right number of questions
    if (!Array.isArray(generatedQuestions) || generatedQuestions.length !== count) {
      throw new Error(`Expected ${count} questions but got ${generatedQuestions?.length || 0}`);
    }

    // Create questions in database
    const createdQuestions = [];
    const errors = [];

    for (let i = 0; i < generatedQuestions.length; i++) {
      try {
        const question = generatedQuestions[i];
        const created = await QuestionModel.createQuestion(
          categoryID,
          level,
          type,
          question.content,
          question.followUp
          // audioUrl is omitted and will be added later
        );
        createdQuestions.push(created);
      } catch (error) {
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : 'Unknown error',
          question: generatedQuestions[i],
        });
      }
    }

    return {
      success: true,
      created: createdQuestions.length,
      total: count,
      questions: createdQuestions,
      errors: errors.length > 0 ? errors : undefined,
    };

  } catch (error) {
    throw new Error(`Failed to generate bulk questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// API route handler
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { categoryID, level, type, count: rawCount } = body ?? {};
    const count = rawCount ? parseInt(rawCount, 10) : 10;

    if (!categoryID || !level || !type) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: categoryID, level, type" },
        { status: 400 }
      );
    }

    const result = await generateBulkQuestions({
      categoryID,
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