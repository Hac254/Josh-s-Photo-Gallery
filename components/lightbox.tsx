"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X, Download } from "lucide-react"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface LightboxProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  imageAlt: string
  downloadUrl: string
  onPrevious?: () => void
  onNext?: () => void
  hasPrevious?: boolean
  hasNext?: boolean
}

export function Lightbox({
  isOpen,
  onClose,
  imageUrl,
  imageAlt,
  downloadUrl,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}: LightboxProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const handleImageError = (e: any) => {
    console.error('Lightbox image load error:', e)
    console.log('Failed URL:', imageUrl)
    setError(true)
    setIsLoading(false)
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(downloadUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = imageAlt
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "max-w-screen-lg w-[95vw] h-[90vh] border-none bg-background/80 p-0 backdrop-blur-md",
          "[&>button]:hidden" // This hides the default close button
        )}
      >
        <DialogTitle className="sr-only">Image Preview</DialogTitle>
        <div className="relative flex flex-col h-full">
          {/* Top bar with controls */}
          <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-50 bg-gradient-to-b from-black/40 to-transparent">
            <p className="text-white text-sm font-medium truncate max-w-[60%]">{imageAlt}</p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={handleDownload}
              >
                <Download className="h-5 w-5" />
                <span className="sr-only">Download image</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>

          {/* Main image container */}
          <div className="relative flex-1 w-full h-full">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            )}
            {!error ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={imageUrl}
                  alt={imageAlt}
                  fill
                  className={`object-contain ${isLoading ? "opacity-0" : "opacity-100"}`}
                  onLoad={() => {
                    console.log('Lightbox image loaded successfully:', imageUrl)
                    setIsLoading(false)
                  }}
                  onError={handleImageError}
                  unoptimized
                  priority
                />
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <p className="text-muted-foreground">Failed to load image</p>
              </div>
            )}
          </div>

          {/* Navigation arrows */}
          {hasPrevious && onPrevious && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
              onClick={onPrevious}
            >
              <ChevronLeft className="h-8 w-8" />
              <span className="sr-only">Previous image</span>
            </Button>
          )}
          {hasNext && onNext && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
              onClick={onNext}
            >
              <ChevronRight className="h-8 w-8" />
              <span className="sr-only">Next image</span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

