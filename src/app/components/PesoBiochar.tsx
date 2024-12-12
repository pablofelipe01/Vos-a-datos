'use client';

import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';

// Extiende el tipo Window para incluir webkitAudioContext
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

export default function TemperaturaProduccionLona() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isSending, setIsSending] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Inicializar el contexto de audio al montar el componente
  useEffect(() => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioContextRef.current = new AudioContextClass();
    }
    return () => {
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const initializeAudioContext = async () => {
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        await initializeAudioContext();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        startRecording(stream);
      } catch (err) {
        console.error('Error al acceder al micrófono:', err);
        alert('No se pudo acceder al micrófono. Verifique los permisos en su navegador.');
      }
    } else {
      stopRecording();
    }
  };

  const startRecording = (stream: MediaStream) => {
    setIsRecording(true);

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/mp4';
    const recorder = new MediaRecorder(stream, { mimeType });

    setMediaRecorder(recorder);

    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      setAudioBlob(blob);

      if (audioPreviewRef.current) {
        const url = URL.createObjectURL(blob);
        audioPreviewRef.current.src = url;
        audioPreviewRef.current.style.display = 'block';
      }
      sendData(blob);
    };

    recorder.start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const sendData = async (blob: Blob) => {
    if (!blob) {
      alert('Por favor, grabe el audio antes de enviarlo.');
      return;
    }

    setIsSending(true);

    const formData = new FormData();
    formData.append('audio', blob, `temperatura_lona.${blob.type.includes('webm') ? 'webm' : 'mp4'}`);

    try {
      const response = await fetch('https://tok-n8n-sol.onrender.com/webhook/e699666b-1126-497e-ba45-4a06aafeaf5e', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        alert('Audio enviado correctamente con los datos de temperatura.');
        setAudioBlob(null);
        if (audioPreviewRef.current) {
          audioPreviewRef.current.style.display = 'none';
          audioPreviewRef.current.src = '';
        }
      } else {
        const responseText = await response.text();
        throw new Error(`El servidor respondió con un error: ${responseText}`);
      }
    } catch (error) {
      console.error('Error al enviar los datos:', error);
      alert('Error al enviar el audio. Por favor intente nuevamente.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      {/* Zona de Instrucciones Personalizadas */}
      <div className="mb-5 text-blue-800">
        <h1 className="text-2xl font-semibold text-center mb-5 text-blue-800">Instrucciones:</h1>
        <ul className="list-disc list-inside">
          <li>Temperatura: R1, R2, R3, H1, H2, H3, H4, G9</li>
        </ul>
      </div>

      {/* Botón para iniciar la grabación */}
      <div className="flex justify-center mb-5">
        <button
          onClick={toggleRecording}
          className={`${
            isRecording ? 'bg-red-600' : 'bg-green-500'
          } text-white py-2 px-4 rounded-md`}
          disabled={isSending}
        >
          {isRecording ? '⏹ Detener' : '🎙 Grabar Temperatura'}
        </button>
      </div>

      {/* Vista previa de audio */}
      <audio
        ref={audioPreviewRef}
        controls
        className={`w-full ${audioBlob ? '' : 'hidden'} mb-5`}
        playsInline
      />

      {/* Estado del Audio */}
      <div className="text-center">
        <p className="text-gray-700 text-lg">
          Estado del Audio: {audioBlob ? '✅ Grabado' : '❌ No grabado'}
        </p>
      </div>
    </div>
  );
}
