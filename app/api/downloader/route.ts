import ytdl from "ytdl-core";
import { NextRequest, NextResponse } from "next/server";
import { enableServerAPI } from "../../../configs/instagram";
import { Exception } from "../../../lib/exceptions";
import { fetchPostJson } from "../../../lib/instagram";
import { VideoInfo } from "../../../types";
import { makeErrorResponse, makeSuccessResponse } from "../../../utils";

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
  } else {
    return NextResponse.json({ error: "Unsupported platform" });
  }

  const resHeaders = {
    "content-Disposition": `attachment; filename="${fileName}"`,
  };

  return NextResponse.json({ format, resHeaders, fileName });
}
