import VoiceRecorder from './components/VoiceRecorder';
import PesoBiochar from './components/PesoBiochar';
import Observaciones from './components/Observaciones';
import PesoBiochar_copy from './components/ContentHydrogen';
import PesoBiochar_copy2 from './components/ContentCarbon';
// import TurnoFinal from './components/TurnoFinal';
import ViajeBiomasa from './components/ViajeBiomasa';
import Jefe from './components/Jefe';
import NavBar from './components/NavBar';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-green-400 to-blue-500 relative">
      <NavBar />
      
      <div className="flex items-center justify-center flex-grow">
        {/* Logo in the top right, adjusted for mobile */}
        <div className="absolute top-2 right-2 md:top-5 md:right-5 z-50">
          <img src="/logo.png" alt="Logo" className="h-12 md:h-16 w-auto" />
        </div>

        <main className="grid grid-cols-1 gap-5 p-5 md:p-10 mt-20">
          {/* VoiceRecorder Frame with 3D shadow effect */}
          <div className="border-2 border-gray-300 rounded-lg shadow-2xl p-5 mb-5 bg-white text-blue-900 mt-10 transform transition-transform hover:scale-105">
            <h2 className="text-xl font-semibold mb-4 text-center">Inicio Turno</h2>
            <VoiceRecorder />
          </div>
          
          {/* PesoBiochar Frame with 3D shadow effect */}
          <div className="border-2 border-gray-300 rounded-lg shadow-2xl p-5 mb-5 bg-white text-blue-900 transform transition-transform hover:scale-105">
            <PesoBiochar />
          </div>

          {/* PesoBiochar_copy Frame */}
          <div className="border-2 border-gray-300 rounded-lg shadow-2xl p-5 mb-5 bg-white text-blue-900 transform transition-transform hover:scale-105">
            <PesoBiochar_copy />
          </div>

          {/* PesoBiochar_copy2 Frame */}
          <div className="border-2 border-gray-300 rounded-lg shadow-2xl p-5 mb-5 bg-white text-blue-900 transform transition-transform hover:scale-105">
            <PesoBiochar_copy2 />
          </div>
          
          {/* Observaciones Frame with 3D shadow effect */}
          <div className="border-2 border-gray-300 rounded-lg shadow-2xl p-6 bg-gradient-to-b from-white to-gray-100 text-blue-900 transform transition-transform hover:scale-105 hover:shadow-3xl">
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">Viaje Biomasa</h2>
            <ViajeBiomasa />
          </div>

          <div className="border-2 border-gray-300 rounded-lg shadow-2xl p-5 bg-white text-blue-900 transform transition-transform hover:scale-105">
            <Observaciones />
          </div>

          <div className="border-2 border-gray-300 rounded-lg shadow-2xl p-5 bg-white text-blue-900 transform transition-transform hover:scale-105">
            <Jefe />
          </div>

          {/* Uncomment the following if TurnoFinal is needed */}
          {/* 
          <div className="border-2 border-gray-300 rounded-lg shadow-2xl p-5 bg-white text-blue-900 transform transition-transform hover:scale-105">
            <TurnoFinal />
          </div> 
          */}
        </main>
      </div>
    </div>
  );
}
