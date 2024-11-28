import NavBar from '../components/NavBar'; // Asegúrate de ajustar la ruta según tu estructura de proyecto

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
      <div className="flex flex-col items-center justify-center py-10">
        {/* Airtable Embed */}
        <iframe
          className="airtable-embed"
          src="https://airtable.com/embed/apprXBBomgiKhVc50/shr6xsVYrJJe428P1"
          frameBorder="0"
          width="80%"
          height="533"
          style={{
            background: "transparent",
            border: "1px solid #ccc",
          }}
        ></iframe>
      </div>
    </div>
  );
}
