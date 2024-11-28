"use client"; // Indica que este componente es del lado del cliente
import NavBar from './components/NavBar';

export default function Home() {
  const images = [
    '/WhatsApp Image 2024-11-28 at 2.34.21 PM.jpeg',
    '/WhatsApp Image 2024-11-28 at 2.34.22 PM.jpeg',
    '/WhatsApp Image 2024-11-28 at 2.34.36 PM.jpeg',
    '/WhatsApp Image 2024-11-28 at 2.35.14 PM.jpeg',
    '/WhatsApp Image 2024-11-26 at 3.21.15 PM (1).jpeg',
    '/WhatsApp Image 2024-11-26 at 3.22.14 PM (1).jpeg',
  ];

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: "url('/h6.png')" }}>
      {/* NavBar */}
      <NavBar />

      {/* Contenido principal */}
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold mb-8 text-center museo-slab" style={{ color: 'FFFFFF' }}>
          Nuestra planta y nuestro equipo de pirolisis
        </h1>

        {/* Carrusel de loop infinito */}
        <div className="relative overflow-hidden w-full h-64">
          <div className="absolute flex animate-scroll w-max">
            {images.concat(images).map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Image ${index + 1}`}
                className="w-auto max-h-64 mx-4 rounded-lg shadow-lg"
              />
            ))}
          </div>
        </div>
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
