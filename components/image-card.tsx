"use client"

import Image from "next/image"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface ImageCardProps {
  src: string
  alt: string
  onClick: () => void
  priority?: boolean
}

export function ImageCard({ src, alt, onClick, priority = false }: ImageCardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const handleImageError = (e: any) => {
    console.error('Image load error:', e)
    console.log('Failed URL:', src)
    setError(true)
    setIsLoading(false)
  }

  return (
    <div
      className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-muted transition-transform hover:scale-[1.02]"
      onClick={onClick}
    >
      {isLoading && (
        <Skeleton className="absolute inset-0" />
      )}
      {!error ? (
        <Image
          src={src}
          alt={alt}
          fill
          className={`object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => {
            console.log('Image loaded successfully:', src)
            setIsLoading(false)
          }}
          onError={handleImageError}
          unoptimized
          priority={priority}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <p className="text-sm text-muted-foreground">Failed to load image</p>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <p className="text-sm font-medium line-clamp-2">{alt}</p>
      </div>
    </div>
  )
}

