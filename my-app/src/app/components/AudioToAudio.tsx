import { useRef, useState } from "react";
import { blob } from "stream/consumers";

export default function AudioToAudio() {
  const [isRecording, setIsRecording] = useState(false);
  const audioChunks = useRef<Blob[]>([]);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const sendbase64AudioToApi = async (audioBlob: Blob) => {
    const url = URL.createObjectURL(audioBlob);
    const audioResponse = await fetch(url);
    const buffer = await audioResponse.arrayBuffer();
    const base64str = Buffer.from(buffer).toString("base64");
    console.log(base64str);

    const response = await fetch("/api/getAudioToAudio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ base64str: base64str }),
    });

    const result = await response.json();
    console.log(result);
  };

  const handleRecording = () => {
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
              type: "audio/wav",
            });
            sendbase64AudioToApi(audioBlob);
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
      onClick={handleRecording}
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
}
