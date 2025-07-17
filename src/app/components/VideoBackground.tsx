"use client";
import React, { useState, useEffect, useRef } from 'react';

interface VideoBackgroundProps {
  src: string;
  fallbackImage?: string;
  className?: string;
  style?: React.CSSProperties;
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({
  src,
  fallbackImage = '/h6.png',
  className = '',
  style = {}
}) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsVideoLoaded(true);
    };

    const handleError = () => {
      setHasError(true);
      console.warn('Video failed to load, falling back to image');
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    // Intentar cargar el video
    video.load();

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
    };
  }, [src]);

  if (hasError) {
    return (
      <div 
        className={`w-full h-full bg-cover bg-center bg-no-repeat ${className}`}
        style={{ 
          backgroundImage: `url('${fallbackImage}')`,
          filter: 'brightness(0.7)',
          ...style 
        }}
      />
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Imagen de fallback que se muestra mientras carga el video */}
      {!isVideoLoaded && (
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url('${fallbackImage}')`,
            filter: 'brightness(0.7)'
          }}
        />
      )}
      
      {/* Video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isVideoLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
          filter: 'brightness(0.7)',
          ...style 
        }}
        preload="metadata"
      >
        <source src={src} type="video/mp4" />
        {/* Texto alternativo para lectores de pantalla */}
        Tu navegador no soporta video HTML5.
      </video>
    </div>
  );
};

export default VideoBackground;
