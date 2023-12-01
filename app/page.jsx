"use client";

import { Inter } from "@next/font/google";
import { useState } from "react";
import axios from "axios";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [videoUrl, setvideoUrl] = useState("");
  const [finalLink, setfinalLink] = useState();
  const [showSelection, setshowSelection] = useState(false);

  const handleDownload = async () => {
    try {
      const res = await axios.get(`/api/downloader?url=${videoUrl}`);
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
