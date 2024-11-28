import Observaciones from '../components/Observaciones';
import Jefe from '../components/Jefe';
import NavBar from '../components/NavBar'; // Importa el componente NavBar

export default function ObservacionesYJefe() {
  return (
    <div 
    className="min-h-screen bg-cover bg-center bg-no-repeat relative"
    style={{ backgroundImage: "url('/h6.png')" }} // Usando la imagen como fondo
    >
      {/* Agrega el NavBar en la parte superior */}
      <NavBar />
      <br />
      <br />

      {/* Contenido principal */}
      <div className="flex items-center justify-center min-h-screen">
        <main className="grid grid-cols-1 gap-5 p-5 md:p-10">
          {/* Observaciones Frame */}
          <div className="border-2 border-gray-300 rounded-lg shadow-2xl p-5 bg-white text-blue-900 transform transition-transform hover:scale-105">
            <h2 className="text-xl font-semibold mb-4 text-center">Observaciones</h2>
            <Observaciones />
          </div>

          {/* Jefe Frame */}
          <div className="border-2 border-gray-300 rounded-lg shadow-2xl p-5 bg-white text-blue-900 transform transition-transform hover:scale-105">
            <h2 className="text-xl font-semibold mb-4 text-center">Jefe</h2>
            <Jefe />
          </div>
        </main>
      </div>
    </div>
  );
}
