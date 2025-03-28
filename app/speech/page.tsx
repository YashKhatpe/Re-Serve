// src/app/page.tsx
'use client';

import { useState, useRef } from 'react';
import toWav from 'audiobuffer-to-wav';

const SAMPLE_RATE = 16000;
export default function Home() {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<string>('How are you feeling today?');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);


  const speakText = async (text: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to convert text to speech');
      }
      const data = await response.json();
      const audioSrc = `data:audio/mp3;base64,${data.audioContent}`
      const audio = new Audio(audioSrc)

      audio.onended = () => {
        // Automatically start recording after the question is spoken
        console.log("Recording starting....")
        startRecording();
      };

      audio.play();
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      console.error('Error speaking text:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const startRecording = async (): Promise<void> => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1, // Request mono channel audio
          sampleRate: SAMPLE_RATE,
        },
      });

      const audioContext = new AudioContext({
        sampleRate: SAMPLE_RATE,
      });
      const source = audioContext.createMediaStreamSource(stream);
      const destination = audioContext.createMediaStreamDestination();
      source.connect(destination);

      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' }); // Capture as WebM
      recorder.ondataavailable = (event: BlobEvent) => { // Changed from BlobEvent to Blob
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        console.log("Audio chunks: ", audioChunksRef)
        // setRecordingStatus('Recording stopped. Processing...');
        sendAudioToBackend();
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      setIsRecording(true);
      // Automatically stop recording after 5 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording();
        }
      })
    } catch (error) {
      console.error('Error capturing audio:', error);
    }
  };


  const sendAudioToBackend = async () => {
    if (audioChunksRef.current.length === 0) {
      setError('No audio recorded');
      return;
    }

    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(audioBlob);

      fileReader.onloadend = async () => {
        const audioContext = new AudioContext({
          sampleRate: SAMPLE_RATE,
        });
        const audioBuffer = await audioContext.decodeAudioData(fileReader.result as ArrayBuffer);

        // Mix down to mono if needed
        const channelData = audioBuffer.getChannelData(0);
        const monoBuffer = audioContext.createBuffer(1, audioBuffer.length, audioBuffer.sampleRate);
        monoBuffer.copyToChannel(channelData, 0);

        // Resample to 16kHz
        const newAudioBuffer = audioContext.createBuffer(1, audioBuffer.length, SAMPLE_RATE);
        const newChannelData = newAudioBuffer.getChannelData(0);
        for (let i = 0; i < audioBuffer.length; i++) {
          newChannelData[i] = channelData[i];
        }

        const wavBuffer = toWav(newAudioBuffer);

        const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });

        const formData = new FormData();
        formData.append("audio", wavBlob, "audio.wav");

        // Send to backend
        const response = await fetch(
          "/api/speech-to-text",
          {

            method: 'POST',
            body: formData,
          });

        if (response.ok) {
          const result = await response.json();
          setError(result.transcript);
          audioChunksRef.current = []
        } else {
          setError('Error uploading audio to server');
        }
      };
    } catch (err) {
      console.error('Error sending audio:', err);
      setError('Error processing or sending audio');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleAskQuestion = (): void => {
    setUserAnswer('');
    speakText(currentQuestion);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-2xl rounded-lg shadow-lg bg-white p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Voice Conversation</h1>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Current Question:</h2>
          <div className="p-4 bg-blue-50 rounded-md">{currentQuestion}</div>
        </div>

        {userAnswer && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Your Answer:</h2>
            <div className="p-4 bg-green-50 rounded-md">{userAnswer}</div>
          </div>
        )}

        <div className="flex justify-center mt-4">
          {isRecording ? (
            <button
              onClick={stopRecording}
              className="px-6 py-3 bg-red-600 text-white rounded-md flex items-center"
            >
              <span className="mr-2">●</span> Recording... (Click to Stop)
            </button>
          ) : (
            <button
              onClick={handleAskQuestion}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-md disabled:bg-blue-300"
            >
              {isLoading ? 'Processing...' : 'Ask Question'}
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            Error: {error}
          </div>
        )}
      </div>
    </main>
  );
}