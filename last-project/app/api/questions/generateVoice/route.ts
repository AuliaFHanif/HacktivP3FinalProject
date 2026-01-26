import { NextResponse } from "next/server";
import { ElevenLabsClient } from "elevenlabs";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure ElevenLabs
const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

async function generateSpeechBuffer(text: string) {
  const voiceId = "hpp4J3VqNfWAUOO0d1Us";
  const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
    text: text,
    model_id: "eleven_multilingual_v2",
    output_format: "mp3_44100_128",
  });

  const chunks = [];
  for await (const chunk of audioStream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function uploadToCloudinary(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video", // mp3 files are uploaded as video type
        folder: "question-audio",
        format: "mp3",
      },
      (error: any, result:any) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { success: false, error: "Text is required" },
        { status: 400 }
      );
    }

    // Generate speech
    const audioBuffer = await generateSpeechBuffer(text);

    // Upload to Cloudinary
    const audioUrl = await uploadToCloudinary(audioBuffer);

    return NextResponse.json(
      { success: true, audioUrl },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating voice:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
    