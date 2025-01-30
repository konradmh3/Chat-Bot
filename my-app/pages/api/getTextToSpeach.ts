import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text input is required" });
    }

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "onyx",
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    const speechFile = path.resolve("./public/speech.mp3");
    await fs.promises.writeFile(speechFile, buffer);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", "attachment; filename=speech.mp3");
    res.status(200).send(buffer);
  } catch (error) {
    console.error("Error generating speech:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
