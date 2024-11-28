//import VoiceRecorder from './components/VoiceRecorder';
//import PesoBiochar from './components/PesoBiochar';
//import Observaciones from './components/Observaciones';
// import TurnoFinal from './components/TurnoFinal';
//import ViajeBiomasa from './components/ViajeBiomasa';
//import Jefe from './components/Jefe';
import NavBar from './components/NavBar';

export default function Home() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/h6.png')" }} // Usando la imagen como fondo
    >
      {/* Agrega el NavBar en la parte superior */}
      <NavBar />

      {/* Contenido principal */}
      
    </div>
  );
}
