import ContentCarbon from '../components/ContentCarbon';
import ContentHydrogen from '../components/ContentHydrogen';
import PorcentajeHumedad from '../components/PorcentajeHumedad';
import NavBar from '../components/NavBar'; // Importa el componente NavBar

export default function contenidos() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-green-400 to-blue-500 relative">
      {/* Agrega el NavBar en la parte superior */}
      <NavBar />
      <br />
      <br />
      <br />

      {/* Contenido principal */}
      <div className="flex items-center justify-center min-h-screen">
        <main className="grid grid-cols-1 gap-5 p-5 md:p-10">
          {/* ContentCarbon Frame */}
          <div className="border-2 border-gray-300 rounded-lg shadow-2xl p-5 mb-5 bg-white text-blue-900 transform transition-transform hover:scale-105">
            <h2 className="text-xl font-semibold mb-4 text-center">Content Carbon</h2>
            <ContentCarbon />
          </div>

          {/* ContentHydrogen Frame */}
          <div className="border-2 border-gray-300 rounded-lg shadow-2xl p-5 bg-white text-blue-900 transform transition-transform hover:scale-105">
            <h2 className="text-xl font-semibold mb-4 text-center">Content Hydrogen</h2>
            <ContentHydrogen />
          </div>

          {/* PorcentajeHumedad Frame */}
          <div className="border-2 border-gray-300 rounded-lg shadow-2xl p-5 bg-white text-blue-900 transform transition-transform hover:scale-105">
            <h2 className="text-xl font-semibold mb-4 text-center">Porcentaje de Humedad</h2>
            <PorcentajeHumedad />
          </div>
        </main>
      </div>
    </div>
  );
}
