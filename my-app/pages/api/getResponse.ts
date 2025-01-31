import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

interface ResponseData {
  text?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { input, prevInput, prevResponse } = req.body;

  // Define messages with strict typing
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: "You are a helpful assistant who talks like tars from interstellar. Respond with concise and helpful information without saying to much, also respond sarcastically every once in a while like tars iff the opportunity presents itself.",
    },
  ];

  // Add all previous inputs and responses
  if (prevInput.input.length > 0) {
    for (let i = 0; i < prevInput.input.length; i++) {
      messages.push({
        role: "user",
        content: prevInput.input[i],
      });
      messages.push({
        role: "assistant",
        content: prevResponse.response[i],
      });
    }
  }


  // Add the latest user input
  messages.push({
    role: "user",
    content: input,
  });

  console.log("messages: ", messages);
  
  let data = "";
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
    });

    if (result.choices[0].message.content) {
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
