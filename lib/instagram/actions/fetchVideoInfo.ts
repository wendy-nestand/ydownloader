"use server";

import { fetchPostJson } from "..";
import { VideoInfo } from "../../../types";
import { makeErrorResponse, makeSuccessResponse } from "../../../utils";
import { Exception } from "../../exceptions";

function handleError(error: any) {
  if (error instanceof Exception) {
    return makeErrorResponse(error.message);
  } else {
    console.error(error);
    return makeErrorResponse();
  }
}

export async function fetchVideoInfoAction(postUrl: string) {
  try {
    const videoInfo = await fetchPostJson(postUrl);
    const response = makeSuccessResponse<VideoInfo>(videoInfo);
    return response;
  } catch (error: any) {
    return handleError(error);
  }
}
