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
    if (err) {
      return res.status(500).json({ text: "Form parse error" });
    }

    // Access the uploaded file
    const audioFile = files.audio;

    if (!audioFile) {
      return res.status(400).json({ text: "No file uploaded" });
    }

    const tempFilePath = audioFile[0].filepath; // Get temporary path for Vercel's runtime
    const tempAudioStream = fs.createReadStream(tempFilePath);

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    try {
      const transcription = await openai.audio.translations.create({
        file: tempAudioStream,
        model: "whisper-1",
      });

      res.status(200).json({ text: transcription });
    } catch (error) {
      console.error("Error with OpenAI API:", error);
      res.status(500).json({ text: "Error processing the audio file" });
    }
  });
}
