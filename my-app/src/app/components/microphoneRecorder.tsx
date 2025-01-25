import { useState, useRef } from "react";

export const MicrophoneRecorder = () => {
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
    } catch (error) {
      console.error("Error:", error);
    }
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
