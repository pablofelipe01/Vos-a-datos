import VoiceRecorder from '../components/VoiceRecorder';
import PesoBiochar from '../components/PesoBiochar';
//import Observaciones from '../components/Observaciones';
//import TurnoFinal from './components/TurnoFinal';
import ViajeBiomasa from '../components/ViajeBiomasa';
//import Jefe from '../components/Jefe';
import NavBar from '../components/NavBar'; // Importa el componente NavBar

export default function PiroliApp() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-green-400 to-blue-500 relative">
      {/* Agrega el NavBar en la parte superior */}
      <NavBar />
      <br />
      <br />

      {/* Contenido principal */}
      <div className="flex items-center justify-center min-h-screen">
        <main className="grid grid-cols-1 gap-5 p-5 md:p-10">
          {/* VoiceRecorder Frame with 3D shadow effect */}
          <div className="border-2 border-gray-300 rounded-lg shadow-2xl p-5 mb-5 bg-white text-blue-900 mt-10 transform transition-transform hover:scale-105">
            <h2 className="text-xl font-semibold mb-4 text-center">Inicio Turno</h2>
            <VoiceRecorder />
          </div>

          {/* PesoBiochar Frame with 3D shadow effect */}
          <div className="border-2 border-gray-300 rounded-lg shadow-2xl p-5 mb-5 bg-white text-blue-900 transform transition-transform hover:scale-105">
            <PesoBiochar />
          </div>

          {/* ViajeBiomasa Frame with 3D shadow effect */}
          <div className="border-2 border-gray-300 rounded-lg shadow-2xl p-6 bg-gradient-to-b from-white to-gray-100 text-blue-900 transform transition-transform hover:scale-105 hover:shadow-3xl">
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">Viaje Biomasa</h2>
            <ViajeBiomasa />
          </div>
        </main>
      </div>
    </div>
  );
}
