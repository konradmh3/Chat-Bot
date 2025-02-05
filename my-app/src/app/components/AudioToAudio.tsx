import { useRef, useState } from "react";
import { blob } from "stream/consumers";

export default function AudioToAudio() {
  const [isRecording, setIsRecording] = useState(false);
  const audioChunks = useRef<Blob[]>([]);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const sendbase64AudioToApi = async (audioBlob: Blob) => {
    const resampledBuffer = await resampleAudio(audioBlob);
    const wavBlob = await audioBufferToWavBlob(resampledBuffer);
    const base64str = await blobToBase64(wavBlob);

    const response = await fetch("/api/getAudioToAudio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ base64str: base64str }),
    });
    const result = await response.json();
    console.log(result);
    if (result.choices[0].message.audio.data) {
      const audioBlob = base64ToBlob(
        result.choices[0].message.audio.data,
        "audio/wav"
      );
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };


  function base64ToBlob(base64: string, mimeType: string) {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let i = 0; i < byteCharacters.length; i += 512) {
      const slice = byteCharacters.slice(i, i + 512);
      const byteNumbers = new Array(slice.length);
      for (let j = 0; j < slice.length; j++) {
        byteNumbers[j] = slice.charCodeAt(j);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    return new Blob(byteArrays, { type: mimeType });
  }


  async function resampleAudio(audioBlob: Blob, targetSampleRate = 16000) {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.duration * targetSampleRate,
      targetSampleRate
    );
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start(0);
    const resampledBuffer = await offlineContext.startRendering();
    return resampledBuffer;
  }


  async function audioBufferToWavBlob(audioBuffer: AudioBuffer) {
    const numOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numOfChannels * 2;
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);
    const channels: Float32Array[] = [];

    for (let i = 0; i < numOfChannels; i++) {
      channels.push(audioBuffer.getChannelData(i));
    }
    let offset = 0;
    function writeString(str: string) {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
      offset += str.length;
    }
    function write16Bit(num: number) {
      view.setUint16(offset, num, true);
      offset += 2;
    }
    function write32Bit(num: number) {
      view.setUint32(offset, num, true);
      offset += 4;
    }
    writeString("RIFF");
    write32Bit(36 + length);
    writeString("WAVE");
    writeString("fmt ");
    write32Bit(16);
    write16Bit(1);
    write16Bit(numOfChannels);
    write32Bit(audioBuffer.sampleRate);
    write32Bit(audioBuffer.sampleRate * numOfChannels * 2);
    write16Bit(numOfChannels * 2);
    write16Bit(16);
    writeString("data");
    write32Bit(length);
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let j = 0; j < numOfChannels; j++) {
        const sample = Math.max(-1, Math.min(1, channels[j][i]));
        view.setInt16(
          offset,
          sample < 0 ? sample * 0x8000 : sample * 0x7fff,
          true
        );
        offset += 2;
      }
    }
    return new Blob([buffer], { type: "audio/wav" });
  }


  async function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result?.toString().split(",")[1] || "";
        resolve(base64String);
      };
      reader.readAsDataURL(blob);
    });
  }


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
