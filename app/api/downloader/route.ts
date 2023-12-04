import ytdl from "ytdl-core";
import instaFetcher from "insta-fetcher";
import tiktokScraper from "tiktok-scraper";
import { NextRequest, NextResponse } from "next/server";
import { enableServerAPI } from "../../../configs/instagram";
import { ClientException, Exception } from "../../../lib/exceptions";
import { fetchPostJson } from "../../../lib/instagram";
import { APIResponse, VideoInfo } from "../../../types";
import { makeErrorResponse, makeSuccessResponse } from "../../../utils";
import { fetchVideoInfoAction } from "../../../lib/instagram/actions/fetchVideoInfo";

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

function handleError(error: any) {
  if (error instanceof Exception) {
    const response = makeErrorResponse(error.message);
    return NextResponse.json(response, { status: error.code });
  } else {
    console.error(error);
    const response = makeErrorResponse();
    return NextResponse.json(response, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!enableServerAPI) {
    return NextResponse.json({ error: "Not Implemented" }, { status: 501 });
  }
  const { searchParams } = new URL(req.url);
  const url: string | null = searchParams.get("url");

  let data, videoFormats, format, fileName;

  if (url?.includes("youtube.com")) {
    // YouTube
    data = await ytdl.getInfo(url);
    videoFormats = ytdl.filterFormats(data.formats, "video");
    format = ytdl.chooseFormat(videoFormats, { quality: "highestaudio" });
    fileName = `${data.videoDetails.title}, ${format.container}`;
  } else if (url?.includes("instagram.com")) {
    // Instagram
    try {
      const postJson = await fetchPostJson(url);
      const response = makeSuccessResponse<VideoInfo>(postJson);
      return NextResponse.json(response, { status: 200 });
    } catch (error: any) {
      return handleError(error);
    }
    // } else if (url.includes("tiktok.com")) {
    //   // TikTok
    //   const tiktokVideo = await tiktokScraper.getVideoMeta(url);
    //   data = { videoDetails: { title: "TikTok Video" } };
    //   videoFormats = [{ url: tiktokVideo.url }];
    //   format = { container: "mp4" }; // Assuming TikTok videos are in mp4 format
    //   fileName = `${data.videoDetails.title}, ${format.container}`;
  } else {
    return NextResponse.json({ error: "Unsupported platform" });
  }

  const resHeaders = {
    "content-Disposition": `attachment; filename="${fileName}"`,
  };

  return NextResponse.json({ format, resHeaders, fileName });
}
