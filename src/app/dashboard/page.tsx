import NavBar from '../components/NavBar'; // Asegúrate de ajustar la ruta según tu estructura de proyecto

export default function dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Renderiza el NavBar */}
      <NavBar />

      {/* Contenido principal */}
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-3xl font-bold text-blue-600">Hola Mundo</h1>
      </div>
    </div>
  );
}
