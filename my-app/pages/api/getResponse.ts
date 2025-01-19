import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

interface ResponseData {
  text: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const { input } = req.body;
  console.log(input);
  let data = "";
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  try {
    const result = await openai.chat.completions.create({
      // model: "gpt-3.5-turbo", // or "gpt-4" if available
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: input }],
    });
    if (result.choices[0].message.content) {
      console.log(result);
      console.log(result.choices);
      data = result.choices[0].message.content;
    } else {
      data = "No content received from the API.";
    }
  } catch (error) {
    console.error("Error:", error);

    data = "Error occurred while fetching data from the API.";
  }
  res.status(200).json({ text: data });
}
