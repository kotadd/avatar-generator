import { NextResponse } from "next/server";
import { Leap } from "@leap-ai/sdk";

const API_KEY = process.env.LEAP_API_KEY!;

export async function POST(request: Request) {
  const res = await request.json();
  const modelId = res.modelId;
  const versionId = res.versionId;

  const leap = new Leap(API_KEY);

  const { data: response, error: responseError } =
    (await leap.fineTune.getModelVersion({
      modelId,
      versionId,
    })) as { data: any; error: any };

  if (responseError) {
    return NextResponse.json({ error: responseError });
  }

  const trainingStatus = response.status;
  return NextResponse.json({ trainingStatus }, { status: 200 });
}
