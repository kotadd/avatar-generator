import { NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";

const API_KEY = process.env.LEAP_API_KEY;

const headers = {
  accept: "application/json",
  Authorization: `Bearer ${API_KEY}`,
};

const createModel = async (title: string) => {
  console.log("Creating model...");
  const { data } = await axios.post(
    "https://api.tryleap.ai/api/v1/images/models",
    {
      title,
      subjectKeyword: "@me",
    },
    {
      headers,
    }
  );
  return data;
};

const uploadSamples = async (images: any, modelId: string) => {
  console.log("Uploading samples...");
  const formImagesData = new FormData();
  for (const image of images) {
    // Convert image to Buffer
    const buffer = Buffer.from(await image.arrayBuffer());
    formImagesData.append("files", buffer, image.name);
  }

  const { data } = await axios.post(
    `https://api.tryleap.ai/api/v1/images/models/${modelId}/samples`,
    formImagesData,
    { headers }
  );

  return data;
};

const trainModel = async (modelId: string) => {
  console.log("Training model...");

  const { data } = await axios.post(
    `https://api.tryleap.ai/api/v1/images/models/${modelId}/queue`,
    {
      baseWeightsId: "ee88d150-4259-4b77-9d0f-090abe29f650",
    },
    { headers }
  );

  return data;
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const title = formData.get("title")!.toString();

  const images = formData.getAll("images");
  console.log(images);

  try {
    // Step #1: Create a new model
    const newModel = await createModel(title);
    console.log("Model created", newModel);

    const modelId = newModel.id;

    // Step #2: Upload samples
    const uploadedImages = await uploadSamples(images, modelId);
    console.log("Uploaded images: ", uploadedImages);

    // Step #3: Train model
    const newVersion = await trainModel(modelId);
    const versionId = newVersion.id;

    console.log("New Training Version: ", newVersion);

    return NextResponse.json({ modelId, versionId }, { status: 200 });
  } catch (error: any) {
    console.log(error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
