'use client';

import { useState } from 'react';

export default function ContentCarbon() {
  const [isSending, setIsSending] = useState(false);
  const [value, setValue] = useState(0); // Valor numérico que se enviará

  const handleClick = async () => {
    setIsSending(true);

    try {
      const response = await fetch('/api/your-endpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }), // Enviar el valor numérico como JSON
      });

      const responseText = await response.text();
      console.log('Response from server:', responseText);

      if (response.ok) {
        alert('Valor enviado exitosamente!');
      } else {
        throw new Error(`Error del servidor: ${response.status}. Respuesta: ${responseText}`);
      }
    } catch (error) {
      console.error('Error enviando valor:', error);
      alert(`No se pudo enviar el valor. Intente nuevamente. Error: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Input para ingresar el valor numérico */}
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="mb-4 px-4 py-2 border rounded-md text-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Ingresa un valor"
      />

      {/* Botón rectangular */}
      <button
        onClick={handleClick}
        disabled={isSending}
        className="text-white text-lg font-semibold px-8 py-4 bg-blue-900 rounded-md shadow-lg transform transition-all hover:shadow-2xl hover:scale-105 active:scale-95 active:shadow-md disabled:opacity-50"
      >
        Enviar contenido de carbón
      </button>
    </div>
  );
}
