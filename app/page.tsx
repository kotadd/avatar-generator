"use client";
import Dropzone from "react-dropzone";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { FaTrashAlt } from "react-icons/fa";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const { push } = useRouter();

  const handleDrop = (acceptedFiles: File[]) => {
    const uniqueFiles = acceptedFiles.filter(
      (file) => !files.some((existingFile) => existingFile.name === file.name)
    );
    setFiles([...files, ...uniqueFiles]);
  };

  const handleDelete = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleSubmit = async () => {
    if (!files.length) {
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }

    try {
      const response = await fetch("/api/finetune", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.error) {
        console.error(data.error);
        setLoading(false);
        return;
      }

      setLoading(false);

      // Redirect the user to the image generate page
      push(`/generate?modelId=${data.modelId}&versionId=${data.versionId}`);
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <main className="container max-w-2xl mx-auto my-10 px-4">
      {/* Image Input Section */}
      <section className="w-full mx-auto mb-12">
        <div className="text-center mb-10">
          <h1 className="font-semibold text-transparent text-5xl bg-gradient-to-r from-blue-500 to-indigo-400 inline-block bg-clip-text">
            AI Avatar Generator
          </h1>
        </div>

        <div className="flex flext-wrap mb-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            id="title"
            name="title"
            placeholder="Type model name"
            type="text"
            className="block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          />
        </div>

        <div className="w-full text-center border-4 border-gray-500 border-dashed round-md cursor-pointer mb-2 text-gray-500">
          <Dropzone onDrop={handleDrop}>
            {({ getRootProps, getInputProps }) => (
              <section>
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <p className="p-10">
                    Drag 'n' drop some files here, or click to select files
                  </p>
                </div>
              </section>
            )}
          </Dropzone>
        </div>

        {title && files.length > 0 && (
          <div className="flex justify-center mt-4 mb-10">
            <button
              disabled={loading}
              onClick={handleSubmit}
              className="py-3 w-1/3 bg-yellow-500 rounded-md text-black text-md font-semibold hover:scale-105 duration-300"
            >
              {loading ? "Uploading..." : "Fine tune"}
            </button>
          </div>
        )}
      </section>
      {/* Image Preview */}
      <section className="grid grid-cols-3 gap-4 mt-4">
        {files.map((file, index) => (
          <div key={index} className="relative">
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              className="object-cover w-full h-full"
            />
            <button
              onClick={() => handleDelete(index)}
              className="absolute top-0 right-0 p-2 bg-yellow-500 text-black"
            >
              <FaTrashAlt />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-50 text-white p-2">
              {file.name}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
