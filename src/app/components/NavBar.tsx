"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { airtableService, EquipoPiroData } from '../services/airtableService';

const NavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [cedula, setCedula] = useState<string>("");
  const [showLoginForm, setShowLoginForm] = useState<boolean>(false);
  const [userData, setUserData] = useState<EquipoPiroData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Verificar si hay una sesión guardada al cargar el componente
  useEffect(() => {
    const savedUserData = localStorage.getItem("userData");
    if (savedUserData) {
      try {
        const parsedUserData = JSON.parse(savedUserData);
        setUserData(parsedUserData);
        setCedula(parsedUserData.Cedula || "");
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing saved user data:", error);
        localStorage.removeItem("userData");
      }
    }
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (cedula.trim().length < 6) {
      setError("Por favor ingrese un número de cédula válido (mínimo 6 dígitos)");
      setIsLoading(false);
      return;
    }

    try {
      console.log("🔍 Validando cédula:", cedula);
      const validatedUser = await airtableService.validateCedula(cedula.trim());
      
      if (validatedUser) {
        setUserData(validatedUser);
        setIsAuthenticated(true);
        setShowLoginForm(false);
        localStorage.setItem("userData", JSON.stringify(validatedUser));
        console.log("✅ Usuario autenticado exitosamente:", validatedUser.Nombre);
      } else {
        setError("Cédula no encontrada. Verifique el número ingresado.");
      }
    } catch (error) {
      console.error("❌ Error durante el login:", error);
      setError("Error al validar la cédula. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCedula("");
    setUserData(null);
    setShowLoginForm(false);
    setError("");
    localStorage.removeItem("userData");
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 w-full bg-black bg-opacity-60 z-50 transition-all duration-300"
      style={{ backdropFilter: "blur(10px)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-14 w-auto object-contain cursor-pointer transition-transform duration-300 hover:scale-105"
              />
            </Link>
          </div>

          {/* Si no está autenticado, mostrar solo el botón de login */}
          {!isAuthenticated ? (
            <div className="flex items-center space-x-4">
              {showLoginForm ? (
                <div className="flex flex-col items-end">
                  <form onSubmit={handleLogin} className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Número de cédula"
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value.replace(/\D/g, ''))} // Solo números
                      className="px-3 py-2 rounded-lg text-black text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={12}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      {isLoading ? "Validando..." : "Ingresar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowLoginForm(false);
                        setError("");
                        setCedula("");
                      }}
                      className="text-white hover:text-gray-300 px-2 py-2 text-sm"
                      disabled={isLoading}
                    >
                      ✕
                    </button>
                  </form>
                  {error && (
                    <div className="mt-2 text-red-400 text-sm max-w-xs">
                      {error}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
                >
                  Iniciar Sesión
                </button>
              )}
            </div>
          ) : (
            // Si está autenticado, mostrar el navbar completo
            <>
              {/* Hamburger Menu (Mobile) */}
              <div className="flex items-center sm:hidden">
                <button
                  onClick={toggleMenu}
                  type="button"
                  className="text-white hover:text-gray-300 focus:outline-none focus:text-gray-300"
                  aria-label="Toggle menu"
                >
                  <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                    {isOpen ? (
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M18.3 5.71a1 1 0 00-1.42-1.42L12 9.17 7.12 4.29A1 1 0 105.7 5.7L10.59 10.6 5.7 15.49a1 1 0 101.42 1.42L12 11.83l4.88 4.88a1 1 0 001.42-1.42L13.41 10.6l4.89-4.89z"
                      />
                    ) : (
                      <path
                        fillRule="evenodd"
                        d="M4 5h16v2H4V5zm0 6h16v2H4v-2zm0 6h16v2H4v-2z"
                      />
                    )}
                  </svg>
                </button>
              </div>

              {/* Navigation Links */}
              <div className="hidden sm:flex sm:items-center sm:space-x-1">
                <Link
                  href="/"
                  className="text-white hover:text-blue-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white hover:bg-opacity-10"
                >
                  Home
                </Link>
                <Link
                  href="/piroliapp"
                  className="text-white hover:text-blue-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white hover:bg-opacity-10"
                >
                  PiroliApp
                </Link>
                
                <Link
                  href="/bitacora"
                  className="text-white hover:text-blue-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white hover:bg-opacity-10"
                >
                  Bitácora
                </Link>

                <Link
                  href="/contenidos"
                  className="text-white hover:text-blue-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white hover:bg-opacity-10"
                >
                  Módulo externo
                </Link>
                <Link
                  href="/seguimiento_turno"
                  className="text-white hover:text-blue-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white hover:bg-opacity-10"
                >
                  Mi Turno
                </Link>
                <Link
                  href="/scaner"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
                >
                  Scanner QR
                </Link>
                
                {/* Botón de logout y mostrar información del usuario */}
                <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-600">
                  <div className="text-white text-sm">
                    <div className="font-medium">{userData?.Nombre || 'Usuario'}</div>
                    <div className="text-xs text-gray-300">
                      {userData?.Cargo || ''} • CC: {userData?.Cedula || cedula}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    Salir
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu - Solo mostrar si está autenticado */}
      {isOpen && isAuthenticated && (
        <div className="sm:hidden bg-black bg-opacity-90 backdrop-blur-md">
          <div className="pt-4 pb-6 space-y-2 px-4">
            <Link
              href="/"
              className="block px-4 py-3 rounded-lg text-base font-medium text-white hover:bg-white hover:bg-opacity-10 transition-all duration-200"
            >
              🏠 Home
            </Link>
            <Link
              href="/piroliapp"
              className="block px-4 py-3 rounded-lg text-base font-medium text-white hover:bg-white hover:bg-opacity-10 transition-all duration-200"
            >
              🔥 PiroliApp
            </Link>
            <Link
              href="/bitacora"
              className="block px-4 py-3 rounded-lg text-base font-medium text-white hover:bg-white hover:bg-opacity-10 transition-all duration-200"
            >
              📋 Bitácora
            </Link>
            <Link
              href="/contenidos"
              className="block px-4 py-3 rounded-lg text-base font-medium text-white hover:bg-white hover:bg-opacity-10 transition-all duration-200"
            >
              🔗 Módulo externo
            </Link>
            <Link
              href="/seguimiento_turno"
              className="block px-4 py-3 rounded-lg text-base font-medium text-white hover:bg-white hover:bg-opacity-10 transition-all duration-200"
            >
              ⏰ Mi Turno
            </Link>
            <Link
              href="/scaner"
              className="block px-4 py-3 rounded-lg text-base font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
            >
              📱 Scanner QR
            </Link>
            
            {/* Info del usuario y logout para móvil */}
            <div className="border-t border-gray-600 pt-4 mt-4">
              <div className="px-4 py-2 text-white text-sm">
                <div className="font-medium">{userData?.Nombre || 'Usuario'}</div>
                <div className="text-xs text-gray-300">
                  {userData?.Cargo || ''} • CC: {userData?.Cedula || cedula}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-3 rounded-lg text-base font-medium bg-red-600 text-white hover:bg-red-700 transition-all duration-200"
              >
                🚪 Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
