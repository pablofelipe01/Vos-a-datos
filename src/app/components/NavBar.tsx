"use client";
import React, { useState } from "react";
import Link from "next/link";

const NavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleMenu = () => {
    setIsOpen(!isOpen);
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
              href="/dashboard"
              className="text-white hover:text-blue-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white hover:bg-opacity-10"
            >
              Dashboard
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
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="sm:hidden bg-black bg-opacity-90 backdrop-blur-md">
          <div className="pt-4 pb-6 space-y-2 px-4">
            <Link
              href="/"
              className="block px-4 py-3 rounded-lg text-base font-medium text-white hover:bg-white hover:bg-opacity-10 transition-all duration-200"
            >
              🏠 Home
            </Link>
            <Link
              href="/dashboard"
              className="block px-4 py-3 rounded-lg text-base font-medium text-white hover:bg-white hover:bg-opacity-10 transition-all duration-200"
            >
              📊 Dashboard
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
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
