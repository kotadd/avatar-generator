"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ColorRing, ThreeDots } from "react-loader-spinner";
import { BsCheckCircleFill, BsCloudDownload } from "react-icons/bs";

import { saveAs } from "file-saver";

type Type = {
  title: string;
  src: string;
  prompt: string;
};

const types: Type[] = [
  {
    title: "LinkedIn",
    src: "https://i.imgur.com/SHP4W2r.png",
    prompt:
      "8k linkedin professional profile photo of @me person in a suit with studio lighting, bokeh, corporate portrait headshot photograph best corporate photography photo winner, meticulous detail, hyperrealistic, centered uncropped symmetrical beautiful",
  },
  {
    title: "Fantasy",
    src: "https://i.imgur.com/uYkJ8Xr.png",
    prompt:
      "8k portrait of @me person, d & d, fantasy, intricate, elegant, highly detailed, digital painting, artstation, concept art, matte, sharp focus, illustration, hearthstone, art by artgerm and greg rutkowski and alphonse mucha, 8k",
  },
  {
    title: "Scooby Doo",
    src: "https://i.imgur.com/HcZNGra.png",
    prompt:
      "portrait of @me as shaggy from scooby doo, green t-shirt, light brown hair, strong, sharp focus, digital art, single subject, concept art, post processed, dynamic lighting, ultra detailed, ((smile)), scooby doo",
  },
  {
    title: "Cyborg",
    src: "https://i.imgur.com/9lHUj6k.png",
    prompt:
      "closeup portrait of @me as a cyborg, detailed face, symmetric, steampunk, cyberpunk, cyborg, intricate detailed, to scale, hyperrealistic, cinematic lighting, digital art, concept art, mdjrny-v4 style",
  },
  {
    title: "Warrior",
    src: "https://i.imgur.com/1veKv4o.png",
    prompt:
      "portrait photo of @me person as a asia warrior chief, tribal panther make up, blue on red, side profile, looking away, serious eyes, 50mm portrait photography, hard rim lighting photography--beta --ar 2:3 --beta --upbeta",
  },
  {
    title: "God",
    src: "https://i.imgur.com/4ZNVafZ.png",
    prompt:
      "painted portrait of @me person as rugged zeus, god of thunder, greek god, white hair, masculine, mature, handsome, upper body, muscular, hairy torso, fantasy, intricate, elegant, highly detailed, digital painting, artstation, concept art, smooth, sharp focus, illustration, art by gaston bussiere and alphonse mucha",
  },
  {
    title: "Punk",
    src: "https://i.imgur.com/M0KWQuJ.png",
    prompt:
      "Punk man, profile photo of @me, grunge style, incredibly detailed, reflection, octane, detailed face, 35mm, F/2.8, 4k",
  },
];

const Generate = () => {
  const queryParams = useSearchParams();
  const modelId = queryParams.get("modelId");
  const versionId = queryParams.get("versionId");

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedTypes, setSelectedTypes] = useState<Type[]>([]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAvatars, setGeneratedAvatars] = useState<string[]>([]);

  const getStatus = async (modelId: string, versionId: string) => {
    const response = await fetch("/api/status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ modelId, versionId }),
    });

    const data = await response.json();

    if (data.error) {
      setLoading(false);
      return;
    }

    return data.trainingStatus;
  };

  const isTrained = async (modelId: string, versionId: string) => {
    // now we poll the model status every 10 seconds until it's finished
    setLoading(true);
    let status = "";

    while (status !== "finished") {
      status = await getStatus(modelId, versionId);
      if (status === undefined) {
        setErrorMessage("Something went wrong");
        setLoading(false);
        return;
      }

      setLoadingMessage(`Training Status: ${status}`);

      if (status === "finished") {
        setLoadingMessage("Your model is now ready to use.");
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 10000)); // wait for 10 seconds
    }
    setLoading(false);
  };

  const generateAvatars = async (modelId: string, prompt: string) => {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ modelId, prompt }),
    });

    const data = await response.json();

    if (data.error) {
      return;
    }

    return data.avatars;
  };

  const handleGenerateAvatars = async () => {
    setIsGenerating(true);

    for (const type of selectedTypes) {
      const newAvatars = await generateAvatars(modelId as string, type.prompt);
      for (const avatar of newAvatars) {
        setGeneratedAvatars((prevAvatars) => [...prevAvatars, avatar]);
        setIsGenerating(false);
      }
    }
  };

  const handleImageClick = (type: Type) => {
    if (selectedTypes.some((selectedType) => selectedType.src === type.src)) {
      // Remove selectedType from the list if it's already in there
      setSelectedTypes(
        selectedTypes.filter((selectedImage) => selectedImage.src !== type.src)
      );
    } else {
      // Add selectedType to the list
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleDownloadAll = async () => {
    let counter = 0;
    generatedAvatars.forEach((img) => {
      // Using CORS Server Proxy to avoid CORS error
      const imageURL = `https://cors-anywhere.herokuapp.com/${img}`;
      fetch(img).then((response) =>
        response
          .blob()
          .then((blob) => {
            saveAs(blob, `${++counter}.jpg`);
          })
          .catch((err) => {
            console.log(err);
          })
      );
    });
  };

  useEffect(() => {
    // console.log("modelId", modelId);
    // console.log("versionId", versionId);

    if (modelId && versionId) {
      isTrained(modelId, versionId);
    } else {
      setErrorMessage("Incorrect model ID and version ID");
    }
  }, []);

  const renderStatus = () => {
    return (
      <section className="w-full mx-auto mb-12">
        <div className="text-center mb-10">
          <h1 className="font-semibold text-transparent text-5xl bg-gradient-to-r from-blue-500 to-indigo-400 inline-block bg-clip-text">
            AI Avatar Generator
          </h1>

          {loading && (
            <div className="flex items-center justify-center mt-10">
              <ColorRing
                visible={true}
                height="80"
                width="80"
                ariaLabel="blocks-loading"
                wrapperStyle={{}}
                wrapperClass="blocks-wrapper"
                colors={["#e15b64", "#f47e60", "#f8b26a", "#abbd81", "#849b87"]}
              />
            </div>
          )}

          {errorMessage && (
            <div className="text-red-600 text-xl text-bold mt-6">
              {loadingMessage}
            </div>
          )}

          <div className="text-green-500 text-xl text-bold mt-6">
            {loadingMessage}
          </div>
        </div>
      </section>
    );
  };

  const renderTypesGrid = () => {
    return (
      <section className="w-full mx-auto mb-12">
        <div className="grid grid-cols-4 gap-4">
          {types.map((type, index) => (
            <div
              onClick={() => handleImageClick(type)}
              key={index}
              className="relative"
            >
              <img
                src={type.src}
                alt=""
                className={`w-full h-full object-cover rounded-md ${
                  selectedTypes.some(
                    (selectedImage) => selectedImage.src === type.src
                  )
                    ? "border-2 border-yellow-500"
                    : ""
                }`}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-50 font-semibold text-white text-sm p-2">
                {type.title}
              </div>
              {selectedTypes.some(
                (selectedImage) => selectedImage.src === type.src
              ) && (
                <div className="absolute top-2 right-2">
                  <button className="absolute top-0 right-0 bg-yellow-500 text-black rounded-full">
                    <BsCheckCircleFill className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {selectedTypes.length > 0 && (
          <div className="mt-5 text-center">
            <button
              disabled={isGenerating}
              onClick={handleGenerateAvatars}
              className={`py-3 w-1/3 bg-yellow-500 rounded-md hover:bg-yellow-600 text-black text-md font-semibold ${
                isGenerating && "cursor-progress"
              }`}
            >
              {isGenerating ? "Generating..." : "Generate Avatars"}
            </button>
          </div>
        )}
      </section>
    );
  };

  const renderGeneratedAvatars = () => {
    return (
      <section className="w-full mx-auto mt-20">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-semibold text-yellow-500">
            Generated Avatars
          </h1>
          {!isGenerating && generatedAvatars.length > 0 && (
            <button
              onClick={handleDownloadAll}
              className="bg-transparent border-yellow-500 text-yellow-500 text-sm py-1 px-4 border rounded-md flex items-center justify-center"
            >
              <BsCloudDownload className="w-4 h-4 mr-2" />
              Download All
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {generatedAvatars.map((image) => (
            <a key={image} href={image} target="_blank">
              <img
                src={image}
                alt=""
                className="w-full h-full object-cover rounded-md"
              />
            </a>
          ))}
          {isGenerating && (
            <div className="flex items-center justify-center">
              <ThreeDots
                height="40"
                width="40"
                color="#eeeeee"
                ariaLabel="three-dots-loading"
                visible={true}
              />
            </div>
          )}
        </div>
      </section>
    );
  };

  return (
    <div className="container max-w-2xl mx-auto my-10 px-4 ">
      {renderStatus()}
      {!loading && renderTypesGrid()}

      {(isGenerating || generatedAvatars.length > 0) &&
        renderGeneratedAvatars()}
    </div>
  );
};

export default Generate;
