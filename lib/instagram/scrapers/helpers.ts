import { getTimedFilename } from "../../../utils";
import { BadRequest, TimeoutException } from "../../exceptions";

export const getIGVideoFileName = () =>
  getTimedFilename("ig-downloader", "mp4");

export const handleScraperError = (error: any) => {
  console.log("Scraper error:", error.message);
  if (error.message.includes("status code 404")) {
    throw new BadRequest("This post is private or does not exist", 404);
  } else if (error instanceof TimeoutException) {
    throw new TimeoutException();
  }
};
