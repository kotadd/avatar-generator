import { Leap } from "@leap-ai/sdk";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const res = await request.json();
  const prompt = res.prompt;
  const modelId = res.modelId;

  const API_KEY = process.env.LEAP_API_KEY!;
  const leap = new Leap(API_KEY);
  let avatars = <string[]>[];

  const { data, error } = await leap.generate.generateImage({
    prompt,
    modelId,
    numberOfImages: 2,
    steps: 20,
    upscaleBy: "x1",
    restoreFaces: true,
  });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  if (data) {
    data.images.forEach((img) => {
      avatars.push(img.uri);
    });
  }

  return NextResponse.json({ avatars }, { status: 200 });
}
