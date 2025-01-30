import React, { useState, useRef } from "react";

interface MicrophoneRecorderProps {
  input: string[];
  setInput: React.Dispatch<React.SetStateAction<string[]>>;
  response: string[];
  setResponse: React.Dispatch<React.SetStateAction<string[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MicrophoneRecorder = ({
  input,
  setInput,
  response,
  setResponse,
  setIsLoading,
}: MicrophoneRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const audioChunks = useRef<Blob[]>([]);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  // create function here that takes audio file and sends to api (api will then call openai speech to text api)
  // for now, once we get a response just console.log it
  const sendAudioToApi = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob);

    try {
      const response = await fetch("/api/getSpeachToText", {
        method: "POST",
        body: formData, // No need to set Content-Type
      });

      const result = await response.json();
      // here lets set input value to the result
      // then call handleResponse
      const inputElement = document.querySelector("input");
      inputElement!.value = result.text.text;
      handleResponse();
    } catch (error) {
      console.error("Error:", error);
    }
  };

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
      setResponse([...response, "Jarvis: " + data.text]);
      getMP3Response(data.text);
    };
    fetchData();
    setIsLoading(false);
  };

  const getMP3Response = async (text: string) => {
    const response = await fetch("/api/getTextToSpeach", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play();
  };

  const handleButtonClick = () => {
    if (!isRecording) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        mediaRecorder.current = new MediaRecorder(stream);
        mediaRecorder.current.ondataavailable = (e) => {
          audioChunks.current.push(e.data);

          if (
            mediaRecorder.current &&
            mediaRecorder.current.state === "inactive"
          ) {
            const audioBlob = new Blob(audioChunks.current, {
              type: "audio/webm",
            });

            sendAudioToApi(audioBlob);
            audioChunks.current = [];
          }
        };
        mediaRecorder.current.start();
      });
    } else {
      mediaRecorder.current?.stop();
    }
    setIsRecording(!isRecording);
  };

  return (
    <button
      onClick={handleButtonClick}
      style={{
        backgroundColor: isRecording ? "red" : "gray",
        borderRadius: "10%",
        width: "25px",
        height: "25px",
        border: "none",
        cursor: "pointer",
      }}
    >
      🎤
    </button>
  );
};
