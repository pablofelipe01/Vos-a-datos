"use client"; // Indica que este componente es del lado del cliente
import NavBar from './components/NavBar';
import EmbedFrame from './components/chatbot';  // Importa EmbedFrame

export default function Home() {
  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: "url('/h6.png')" }}>
      {/* NavBar */}
      <NavBar />

      {/* Contenido principal */}
      <div className="flex flex-col items-center justify-center min-h-screen">
        {/* Componente EmbedFrame (iframe) */}
        <EmbedFrame />
      </div>

      {/* Estilos globales */}
      <style global jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Museo+Slab:wght@200&display=swap');

        .museo-slab {
          font-family: 'Museo Slab', serif;
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
