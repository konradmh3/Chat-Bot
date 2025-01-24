import { useState, useRef } from "react";


export const MicrophoneRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const audioChunks = useRef<Blob[]>([]);
    const mediaRecorder = useRef<MediaRecorder | null>(null);

    const handleButtonClick = () => {
      if (!isRecording) {
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => {
            mediaRecorder.current = new MediaRecorder(stream);
            mediaRecorder.current.ondataavailable = (e) => {
                console.log(e.data);
              audioChunks.current.push(e.data);                
              console.log(audioChunks.current);

              if (mediaRecorder.current && mediaRecorder.current.state === "inactive") {
                const audioBlob = new Blob(audioChunks.current, {
                  type: "audio/webm",
                });
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                console.log(audio);
                audio.play();
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
          backgroundColor: isRecording ? 'red' : 'gray',
          borderRadius: '10%',
          width: '25px',
          height: '25px',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        🎤
      </button>
    );
  };