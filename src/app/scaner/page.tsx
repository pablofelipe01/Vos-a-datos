import NavBar from '../components/NavBar'; // Asegúrate de ajustar la ruta según tu estructura de proyecto
import ScanBache from '../components/ScanBache'; // Importa el componente ScanBache

export default function dashboard() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/h6.png')" }} // Usando la imagen como fondo
    >
      {/* Renderiza el NavBar */}
      <NavBar />
      <br />
      <br />
      <br />

      {/* Contenido principal */}
      <div className="flex items-center justify-center min-h-screen">
        {/* ScanBache Frame */}
        <div className="border-2 border-gray-300 rounded-lg shadow-2xl p-5 bg-white text-blue-900 transform transition-transform hover:scale-105">
          <h2 className="text-xl font-semibold mb-4 text-center">Escanear Bache</h2>
          <ScanBache />
        </div>
      </div>
    </div>
  );
}
