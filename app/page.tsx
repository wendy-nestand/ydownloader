"use client";

import { Inter } from "@next/font/google";
import { useState } from "react";
import axios from "axios";
import { ClientException } from "../lib/exceptions";
import { fetchVideoInfoAction } from "../lib/instagram/actions/fetchVideoInfo";
import { APIResponse, VideoInfo } from "../types";
const isValidFormInput = (postUrl: string) => {
  if (!postUrl) {
    return "Instagram URL was not provided";
  }

  if (!postUrl.includes("instagram.com/")) {
    return "Invalid URL does not contain Instagram domain";
  }

  if (!postUrl.startsWith("https://")) {
    return 'Invalid URL it should start with "https://www.instagram.com..."';
  }

  const postRegex =
    /^https:\/\/(?:www\.)?instagram\.com\/p\/([a-zA-Z0-9_-]+)\/?/;

  const reelRegex =
    /^https:\/\/(?:www\.)?instagram\.com\/reels?\/([a-zA-Z0-9_-]+)\/?/;

  if (!postRegex.test(postUrl) && !reelRegex.test(postUrl)) {
    return "URL does not match Instagram post or reel";
  }

  return "";
};

const startFileDownload = (
  url: string,
  filename: string,
  target: string = "_self"
) => {
  const a = document.createElement("a");
  a.target = target;
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

const downloadFile = async (filename: string, downloadUrl: string) => {
  try {
    const response = await fetch(downloadUrl);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    startFileDownload(blobUrl, filename);
  } catch (error) {
    startFileDownload(downloadUrl, filename, "_blank");
    console.log(error);
  }
};

const downloadPostVideo = async (postUrl: string) => {
  const inputError = isValidFormInput(postUrl);
  if (inputError) {
    throw new ClientException(inputError);
  }

  const response: APIResponse<VideoInfo> = await fetchVideoInfoAction(postUrl);

  if (response.status === "error") {
    throw new ClientException(response.message);
  }

  if (!response.data) {
    throw new ClientException();
  }

  const { filename, videoUrl } = response.data;
  await downloadFile(filename, videoUrl);
};

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [videoUrl, setvideoUrl] = useState("");
  const [finalLink, setfinalLink] = useState();
  const [showSelection, setshowSelection] = useState(false);

  const handleDownload = async () => {
    try {
      const res = await axios.get(`/api/downloader?url=${videoUrl}`);

      await downloadPostVideo(videoUrl);

      setfinalLink(res.data.format.url);
      setshowSelection(true);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <main className="mx-auto md:max-w-6xl px-4">
      <div></div>
      <header className=" flex justify-between mx-auto mx-w-6xl py-4 "></header>
      <div className="flex flex-col rounded-md  items-center min-h-[450px] justify-center ">
        <h3 className="text-xl font-semibold tracking-wider ">
          Youtube Video Downloader
        </h3>
        <div className="mt-4 space-x-2 w-full p-4 flex justify-center">
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setvideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=4cEKAYnxbrk&ab_channel=ChillMusicLab..."
            className="p-2 w-[60%] outline-none border border-black rounded-md text-black"
          ></input>
          <button
            className="border rounded-md py-1 px-4 bg-lime-500 font-semibold shadow-md"
            onClick={handleDownload}
          >
            Convert
          </button>
        </div>
      </div>
      {showSelection && (
        <div className="mb-10 flex items-center justify-center mt-0 rounded-md shadow-lg">
          <video src={finalLink} controls></video>
        </div>
      )}
    </main>
  );
}
