import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

// to pass a argument to this function, use the following URL:
// http://localhost:3000/api/hello?name=John
// then to access the argument, use the following code:

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

// const openai = new OpenAI({
// });

// const handleAPIcall = async () => {
//   setIsLoading(true);
//   const inputElement = document.querySelector("input");
//   var value = "";
//   if (inputElement && inputElement.value) {
//     value = inputElement.value;
//     setInput([...input, "You: " + inputElement.value]);
//   }
//   try {
//     const result = await openai.chat.completions.create({
//       // model: "gpt-3.5-turbo", // or "gpt-4" if available
//       model: "gpt-4o-mini",
//       messages: [{ role: "user", content: value }],
//     });
//     if (result.choices[0].message.content) {
//       setResponse([
//         ...response,
//         "Jarvis: " + result.choices[0].message.content,
//       ]);
//     } else {
//       setResponse([...response, "Jarvis: No content received from the API."]);
//     }
//   } catch (error) {
//     console.error("Error:", error);
//     setResponse([
//       ...response,
//       "Jarvis: Error occurred while fetching data from the API.",
//     ]);
//   }
//   setIsLoading(false);
// };
