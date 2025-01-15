"use client"; // Indica que este componente es del lado del cliente
import React, { useState, useRef } from "react";

const EmbedFrame = () => {
  const [showChat, setShowChat] = useState(false); // Estado para controlar la visibilidad del chat
  const [isMaximized, setIsMaximized] = useState(false); // Estado para controlar si el chat está maximizado
  const chatWindowRef = useRef(null); // Ref para el contenedor de la ventana del chat
  const [position, setPosition] = useState({ x: 0, y: 0 }); // Posición de la ventana
  const [isDragging, setIsDragging] = useState(false); // Estado para manejar el arrastre

  // Función para manejar el inicio del arrastre
  const startDrag = (e) => {
    setIsDragging(true);
    const offsetX = e.clientX - chatWindowRef.current.getBoundingClientRect().left;
    const offsetY = e.clientY - chatWindowRef.current.getBoundingClientRect().top;

    const dragMove = (moveEvent) => {
      if (isDragging) {
        setPosition({
          x: moveEvent.clientX - offsetX,
          y: moveEvent.clientY - offsetY,
        });
      }
    };

    const stopDrag = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", dragMove);
      document.removeEventListener("mouseup", stopDrag);
    };

    document.addEventListener("mousemove", dragMove);
    document.addEventListener("mouseup", stopDrag);
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const closeChat = () => {
    setShowChat(false); // Oculta el chat
  };

  return (
    <div>
      {/* Globito en la esquina inferior derecha */}
      <div
        onClick={() => setShowChat(!showChat)} // Alterna la visibilidad del chat
        className="absolute bottom-10 right-10 cursor-pointer"
        style={{
          backgroundImage: 'url("/capi.png")', // Asegúrate de que la imagen esté en la carpeta public
          backgroundSize: "cover",
          width: "100px", // Tamaño del globito
          height: "100px", // Tamaño del globito
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: 100, // Asegura que el globito esté encima de otros elementos
        }}
      ></div>

      {/* Ventana de chat que se despliega cuando se hace clic en el globito */}
      {showChat && (
        <div
          ref={chatWindowRef}
          style={{
            position: "absolute",
            bottom: "40px",
            right: "20px",
            width: isMaximized ? "80vw" : "400px", // Ajuste dinámico del tamaño
            height: isMaximized ? "80vh" : "500px", // Ajuste dinámico de la altura
            border: "2px solid #ccc", // Borde del recuadro
            borderRadius: "10px", // Bordes redondeados para el recuadro
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Sombra para el recuadro
            overflow: "hidden", // Evita que el contenido se salga del recuadro
            zIndex: 101, // Asegura que el chat esté por encima de otros elementos
            top: position.y,
            left: position.x,
            transition: "all 0.3s ease", // Transición suave para los cambios de tamaño
          }}
          onMouseDown={startDrag} // Activa el arrastre cuando se hace clic en la ventana
        >
          {/* Barra superior con botones */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px",
              backgroundColor: "#f1f1f1",
              cursor: "move", // Cambia el cursor para simular el arrastre
              userSelect: "none", // Evita la selección de texto al arrastrar
            }}
          >
            <div style={{ fontWeight: "bold" }}> </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={toggleMaximize} style={buttonStyle}>🗖</button> {/* Maximizar */}
              <button onClick={closeChat} style={buttonStyle}>❌</button> {/* Cerrar */}
            </div>
          </div>

          {/* Contenido del chat (iframe) */}
          <iframe
            src="https://pirolybot.vercel.app/bot"
            style={{
              width: "100%", // Hace que el iframe ocupe todo el ancho del recuadro
              height: "100%", // Hace que el iframe ocupe todo el alto del recuadro
              border: "none", // Elimina el borde del iframe
            }}
            title="Piroly Bot"
            allow="microphone; accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}
    </div>
  );
};

// Estilo de los botones de maximizar y cerrar
const buttonStyle = {
  background: "none",
  border: "none",
  fontSize: "16px",
  cursor: "pointer",
  color: "#333", // Color de los botones
};

export default EmbedFrame;
