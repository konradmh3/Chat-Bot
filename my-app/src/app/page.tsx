"use client";

import { useState } from "react";
import { MicrophoneRecorder } from "./components/microphoneRecorder";
import AudioToAudio from "./components/AudioToAudio";

export default function Home() {
  const [input, setInput] = useState<string[]>([]);
  const [response, setResponse] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleResponse = async () => {
    setIsLoading(true);
    const inputElement = document.querySelector("input");
    setInput([...input, "" + inputElement?.value]);
    const fetchData = async () => {
      const data = await fetch("/api/getResponse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: inputElement?.value, prevInput: {input}, prevResponse: {response} }),
      });
      const result = await data.json();
      setResponse([...response, "" + result.text]);
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
                <div className="w-fit">You: {input[index]}</div>
              </div>
              <div>
                <br />
                {/* split response(item) by \n and map each */}
                Jarvis:{item.split("\n").map((line, idx) => (
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
          {/* <MicrophoneRecorder
            input={input}
            setInput={setInput}
            response={response}
            setResponse={setResponse}
            setIsLoading={setIsLoading}
          /> */}
          <AudioToAudio/>
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
