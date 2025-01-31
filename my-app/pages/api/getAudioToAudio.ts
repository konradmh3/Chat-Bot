import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const { base64str } = req.body;
  // put in correct format off wav file as base64 string


  console.log("server body data: ", base64str);

  if (req.method === "POST") {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-audio-preview",
      modalities: ["text", "audio"],
      audio: { voice: "alloy", format: "wav" },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Respond to the voice in this audio" },
            {
              type: "input_audio",
              input_audio: { data: base64str, format: "wav" },
            },
          ],
        },
      ],
      store: true,
    });
    console.log(response);
    console.log(response.choices[0]);
    res.status(200).json(response);
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
