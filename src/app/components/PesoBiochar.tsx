'use client';

import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';

// Extiende el tipo Window para incluir RecordRTC
declare global {
  interface Window {
    RecordRTC?: typeof import('recordrtc');
  }
}

export default function TemperaturaProduccionLona() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isClient, setIsClient] = useState(false);  // Estado para verificar si está en el cliente

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  const isAppleDevice = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Mac/.test(navigator.userAgent);

  useEffect(() => {
    // Verifica si estamos en el cliente
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return; // No ejecutar en el servidor

    // Carga dinámica de RecordRTC en dispositivos Apple
    const loadRecordRTC = async () => {
      if (isAppleDevice && !window.RecordRTC) {
        const { default: RecordRTC } = await import('recordrtc');
        window.RecordRTC = RecordRTC;
      }
    };

    loadRecordRTC();

    return () => {
      // Limpieza de recursos en el desmontaje
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isClient, isAppleDevice]);

  const toggleRecording = async () => {
    if (!isClient) return; // No permitir grabación en el servidor

    if (isRecording) {
      stopRecording();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        startRecording(stream);
      } catch (error) {
        console.error('Error al acceder al micrófono:', error);
        alert('No se pudo acceder al micrófono. Verifique los permisos en su navegador.');
      }
    }
  };

  const startRecording = (stream: MediaStream) => {
    setIsRecording(true);

    if (isAppleDevice && window.RecordRTC) {
      const recorder = new window.RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/webm',
        recorderType: window.RecordRTC.StereoAudioRecorder,
      });
      recorder.startRecording();
      recorderRef.current = recorder; // Aquí recorderRef se asigna de manera segura
    } else {
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        handleRecordingComplete(blob);
      };

      recorder.start();
      recorderRef.current = recorder;
    }
  };

  const stopRecording = () => {
    setIsRecording(false);

    // Verificar si recorderRef.current no es null antes de llamar a stopRecording
    if (isAppleDevice && recorderRef.current) {
      recorderRef.current.stopRecording(() => {
        const blob = recorderRef.current.getBlob();
        handleRecordingComplete(blob);
      });
    } else if (recorderRef.current instanceof MediaRecorder) {
      recorderRef.current.stop();
    }

    // Detener el stream de audio
    streamRef.current?.getTracks().forEach((track) => track.stop());
  };

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);

    if (audioPreviewRef.current) {
      const url = URL.createObjectURL(blob);
      audioPreviewRef.current.src = url;
      audioPreviewRef.current.style.display = 'block';
    }
  };

  const sendData = async () => {
    if (!audioBlob) {
      alert('Por favor, grabe el audio antes de enviarlo.');
      return;
    }

    setIsSending(true);

    const formData = new FormData();
    formData.append('audio', audioBlob, `temperatura_lona.${audioBlob.type.includes('webm') ? 'webm' : 'mp4'}`);

    try {
      const response = await fetch('https://tok-n8n-sol.onrender.com/webhook/e699666b-1126-497e-ba45-4a06aafeaf5e', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        alert('Audio enviado correctamente.');
        resetRecording();
      } else {
        throw new Error(`Error del servidor: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error al enviar los datos:', error);
      alert('Error al enviar el audio. Por favor intente nuevamente.');
    } finally {
      setIsSending(false);
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    if (audioPreviewRef.current) {
      audioPreviewRef.current.style.display = 'none';
      audioPreviewRef.current.src = '';
    }
  };

  return (
    <div className="p-4 max-w-screen-sm mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-center mb-5">Instrucciones:</h1>
        <ul className="list-disc list-inside">
          <li>Temperatura: R1, R2, R3, H1, H2, H3, H4, G9</li>
        </ul>
      </div>

      <div className="flex justify-center mb-5">
        <button
          onClick={toggleRecording}
          className={`${isRecording ? 'bg-red-600' : 'bg-green-500'} text-white py-2 px-4 rounded-md`}
          disabled={isSending}
        >
          {isRecording ? '⏹ Detener' : '🎙 Grabar Temperatura'}
        </button>
      </div>

      <audio ref={audioPreviewRef} controls className="w-full hidden mb-5" playsInline />

      <div className="text-center">
        <p className="text-gray-700 text-lg">
          Estado del Audio: {audioBlob ? '✅ Grabado' : '❌ No grabado'}
        </p>
        <button
          onClick={sendData}
          className="bg-blue-500 text-white py-2 px-4 rounded-md mt-5"
          disabled={!audioBlob || isSending}
        >
          {isSending ? 'Enviando...' : 'Enviar Audio'}
        </button>
      </div>
    </div>
  );
}
