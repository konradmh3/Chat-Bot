"use client";

import Image from "next/image";
import OpenAI from "openai";
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState<string[]>([]);
  const [response, setResponse] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const openai = new OpenAI({
  });

  const handleAPIcall = async () => {
    setIsLoading(true);
    const inputElement = document.querySelector("input");
    var value = "";
    if (inputElement && inputElement.value) {
      value = inputElement.value;
      setInput([...input, "You: " + inputElement.value]);
    }
    try {
      const result = await openai.chat.completions.create({
        // model: "gpt-3.5-turbo", // or "gpt-4" if available
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: value }],
      });
      if (result.choices[0].message.content) {
        setResponse([
          ...response,
          "Jarvis: " + result.choices[0].message.content,
        ]);
      } else {
        setResponse([...response, "Jarvis: No content received from the API."]);
      }
    } catch (error) {
      console.error("Error:", error);
      setResponse([
        ...response,
        "Jarvis: Error occurred while fetching data from the API.",
      ]);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col justify-between min-h-screen py-2">
      <div>
        {response.map((item, index) => (
          <p key={index} className="text-white flex flex-col mx-2">
            <div className="flex justify-end">
              <div className="w-fit">{input[index]}</div>
            </div>
            <div>{item}</div>
          </p>
        ))}
      </div>
      <div className="flex items-center justify-center py-2">
        <input
          className="text-black mx-2 px-2 rounded-sm"
          type="text"
          placeholder="Ask me anything!"
        />
        <button
          disabled={isLoading}
          onClick={handleAPIcall}
          className="bg-gray-500 px-2 rounded-sm"
        >
          {isLoading ? "Generating..." : "Enter"}
        </button>
      </div>
    </div>
  );
}
