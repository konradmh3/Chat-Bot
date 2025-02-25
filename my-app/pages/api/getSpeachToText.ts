import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parser to handle multipart form-data
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed!" });
  }
  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    // Access the uploaded file
    const audioFile = files.audio;

    if (!audioFile) {
      return res.status(400).json({ text: "No file uploaded" });
    }

    const tempFilePath = audioFile[0].filepath; // Get temporary path
    const newPath = path.join(process.cwd(), "public", "uploads", "audio.webm");

    // Move the file to a desired location
    fs.rename(tempFilePath, newPath, async (err) => {
      if (err) {
        console.error("Error saving file:", err);
        return res.status(500).json({ text: "File save failed" });
      }

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const transcription = await openai.audio.translations.create({
        file: fs.createReadStream("public/uploads/audio.webm"),
        model: "whisper-1",
      });      
      // console.log(transcription);
      res.status(200).json({ text: transcription});
    });
  });
}
