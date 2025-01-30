"use client";

import { useEffect, useState } from "react";
import { MicrophoneRecorder } from "./components/microphoneRecorder";

export default function Home() {
  const [input, setInput] = useState<string[]>([]);
  const [response, setResponse] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleResponse = async () => {
    setIsLoading(true);
    const inputElement = document.querySelector("input");
    setInput([...input, "You: " + inputElement?.value]);
    const fetchData = async () => {
      const tempResp = await fetch("/api/getResponse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: inputElement?.value }),
      });
      const data = await tempResp.json();

      console.log(data);
      setResponse([...response, "Jarvis: " + data.text]);
    };
    fetchData();
    setIsLoading(false);
  };

  return (
    <>
      <div className="flex flex-col justify-between max-h-full py-2">
        <div>
          {response.map((item, index) => (
            <div key={index} className="text-white flex flex-col mx-2">
              <div className="flex justify-end">
                <div className="w-fit">{input[index]}</div>
              </div>
              <div>
                <br />
                {/* split response(item) by \n and map each */}
                {item.split("\n").map((line, idx) => (
                  <div key={idx} className="w-fit">
                    {line}
                    <br />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center py-2 bg-gray-800 fixed bottom-0 w-full">
          <MicrophoneRecorder
            input={input}
            setInput={setInput}
            response={response}
            setResponse={setResponse}
            setIsLoading={setIsLoading}
          />
          <input
            className="text-black mx-2 px-2 rounded-sm"
            type="text"
            placeholder="Ask me anything!"
          />
          <button
            disabled={isLoading}
            onClick={handleResponse}
            className="bg-gray-500 px-2 rounded-sm"
          >
            {isLoading ? "Generating..." : "Enter"}
          </button>
        </div>
      </div>
    </>
  );
}
