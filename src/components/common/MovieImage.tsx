'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Film } from 'lucide-react';

interface MovieImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Composant Image avec gestion des erreurs 404.
 * Affiche un placeholder en cas d'erreur de chargement.
 */
export function MovieImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = '',
  sizes,
  priority = false,
}: MovieImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Si erreur, afficher un placeholder
  if (hasError) {
    return (
      <div className={`bg-gradient-to-br from-red-900/50 to-orange-900/50 flex items-center justify-center ${fill ? 'absolute inset-0' : ''}`} style={!fill ? { width, height } : undefined}>
        <Film className="w-12 h-12 text-white/50" />
      </div>
    );
  }

  if (fill) {
    return (
      <>
        {isLoading && (
          <div className="absolute inset-0 bg-white/5 animate-pulse" />
        )}
        <Image
          src={src}
          alt={alt}
          fill
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          sizes={sizes}
          priority={priority}
          onError={() => setHasError(true)}
          onLoad={() => setIsLoading(false)}
        />
      </>
    );
  }

  return (
    <>
      {isLoading && (
        <div className="bg-white/5 animate-pulse" style={{ width, height }} />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        sizes={sizes}
        priority={priority}
        onError={() => setHasError(true)}
        onLoad={() => setIsLoading(false)}
      />
    </>
  );
}

export default MovieImage;
