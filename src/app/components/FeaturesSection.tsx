"use client";
import React from 'react';
import Link from 'next/link';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      title: "Control de Procesos",
      description: "Monitoreo en tiempo real de temperatura, presión y flujo en reactores de pirólisis",
      icon: "🌡️",
      href: "/piroliapp",
      features: ["Grabación de voz operacional", "Control de temperatura", "Gestión de flujos", "Alertas en tiempo real"]
    },
    {
      title: "Dashboard Operativo",
      description: "Panel de control especializado para supervisión de planta de pirólisis",
      icon: "📊",
      href: "/dashboard",
      features: ["Métricas de producción", "Eficiencia energética", "Calidad del biochar", "Rendimiento por lote"]
    },
    {
      title: "Bitácora de Operaciones",
      description: "Registro detallado de todos los procesos y eventos de la planta",
      icon: "📋",
      href: "/bitacora",
      features: ["Log de temperatura", "Incidencias registradas", "Mantenimientos", "Cambios de turno"]
    },
    {
      title: "Gestión Mi Turno",
      description: "Control de personal y seguimiento mi turno con integración Airtable",
      icon: "⏰",
      href: "/seguimiento_turno",
      features: ["Asistencia personal", "Control mi turno", "Productividad por equipo", "Reportes automáticos"]
    },
    {
      title: "Control de Calidad",
      description: "Escaneo QR para trazabilidad de lotes y control de calidad del biochar",
      icon: "�",
      href: "/scaner",
      features: ["Trazabilidad de lotes", "Control de calidad", "Identificación QR", "Certificaciones"]
    },
    {
      title: "Gestión de Biomasa",
      description: "Control de materia prima, pesaje y registro de entrada de biomasa",
      icon: "🌾",
      href: "/contenidos",
      features: ["Pesaje automático", "Clasificación biomasa", "Humedad y densidad", "Registro de proveedores"]
    }
  ];

  return (
    <section className="py-20 bg-gray-50" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado de la sección */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 museo-slab">
            Módulos de Control de Pirólisis
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Herramientas especializadas para optimizar cada aspecto de tu planta de pirólisis, desde el control de procesos hasta la gestión de personal
          </p>
        </div>

        {/* Grid de características */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              {/* Icono */}
              <div className="text-4xl mb-4">{feature.icon}</div>
              
              {/* Título */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              
              {/* Descripción */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                {feature.description}
              </p>
              
              {/* Lista de características */}
              <ul className="space-y-2 mb-6">
                {feature.features.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              
              {/* Botón de acción */}
              <Link href={feature.href}>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                  Acceder
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
