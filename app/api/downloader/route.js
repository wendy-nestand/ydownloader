import ytdl from "ytdl-core";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  const data = await ytdl.getInfo(url);
  const videoFormats = ytdl.filterFormats(data.formats, "video");
  const format = ytdl.chooseFormat(videoFormats, { quality: "highestaudio" });

  const fileName = `${data.videoDetails.title}, ${format.container}`;
  const resHeaders = {
    "content-Disposition": `attachment; filename="${fileName}"`,
  };

  return NextResponse.json({ format, resHeaders, fileName });
}
