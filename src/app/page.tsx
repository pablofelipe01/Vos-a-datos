"use client";
import NavBar from './components/NavBar';
import FeaturesSection from './components/FeaturesSection';
import VideoBackground from './components/VideoBackground';

export default function Home() {
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {/* Hero Section con Video Background */}
      <div className="relative min-h-screen overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full">
          <VideoBackground
            src="https://res.cloudinary.com/dvnuttrox/video/upload/v1752168408/corte_pirolisis_pitch_deck_-_Made_with_Clipchamp_1_1_chu5dg.mp4"
            fallbackImage="/h6.png"
          />
          
          {/* Overlay oscuro para mejorar legibilidad */}
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        </div>

        {/* NavBar */}
        <NavBar />

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
          <div className="max-w-4xl mx-auto">
            {/* Título Principal */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 museo-slab animate-fade-in">
              PiroliApp
            </h1>
            
            {/* Subtítulo */}
            <p className="text-xl md:text-2xl text-gray-200 mb-16 max-w-3xl mx-auto leading-relaxed animate-fade-in-delay">
              Plataforma integral para optimización de procesos de pirólisis. Control de temperatura, gestión de biomasa y seguimiento mi turno en tiempo real.
            </p>

            {/* Características destacadas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-fade-in-delay-3">
              <div className="text-center p-6 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm hover:bg-opacity-20 transition-all duration-300">
                <div className="text-3xl mb-4">�️</div>
                <h3 className="text-lg font-semibold text-white mb-2">Control de Temperatura</h3>
                <p className="text-gray-300 text-sm">Monitoreo continuo de temperatura en reactores de pirólisis</p>
              </div>
              
              <div className="text-center p-6 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm hover:bg-opacity-20 transition-all duration-300">
                <div className="text-3xl mb-4">🏭</div>
                <h3 className="text-lg font-semibold text-white mb-2">Gestión de Biomasa</h3>
                <p className="text-gray-300 text-sm">Control de flujo, peso y calidad de materia prima</p>
              </div>
              
              <div className="text-center p-6 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm hover:bg-opacity-20 transition-all duration-300">
                <div className="text-3xl mb-4">⚗️</div>
                <h3 className="text-lg font-semibold text-white mb-2">Producción Biochar</h3>
                <p className="text-gray-300 text-sm">Seguimiento de rendimiento y calidad del producto final</p>
              </div>
            </div>
          </div>
        </div>

        {/* Indicador de scroll */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <button 
            onClick={scrollToFeatures} 
            className="animate-bounce hover:animate-none transition-all duration-300 hover:scale-110"
            aria-label="Scroll to features"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Sección de Características */}
      <FeaturesSection />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <img src="/logo.png" alt="Logo" className="h-12 w-auto mb-4" />
              <p className="text-gray-400">
                Soluciones tecnológicas avanzadas para la industria de pirólisis y gestión de biochar con PiroliApp.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
              <ul className="space-y-2">
                <li><a href="/piroliapp" className="text-gray-400 hover:text-white transition-colors">PiroliApp</a></li>
                <li><a href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</a></li>
                <li><a href="/bitacora" className="text-gray-400 hover:text-white transition-colors">Bitácora</a></li>
                <li><a href="/scaner" className="text-gray-400 hover:text-white transition-colors">Scanner</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <p className="text-gray-400">
                Para soporte técnico y consultas sobre nuestras aplicaciones.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 PiroliApp. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Estilos globales */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Museo+Slab:wght@300;400;700&display=swap');

        .museo-slab {
          font-family: 'Museo Slab', serif;
        }

        html {
          scroll-behavior: smooth;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }

        .animate-fade-in-delay {
          animation: fadeIn 1s ease-out 0.3s both;
        }

        .animate-fade-in-delay-2 {
          animation: fadeIn 1s ease-out 0.6s both;
        }

        .animate-fade-in-delay-3 {
          animation: fadeIn 1s ease-out 0.9s both;
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
