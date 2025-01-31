"use client"

import { useState, Suspense } from "react"
import { Header } from "@/components/header"
import { ImageCard } from "@/components/image-card"
import { FolderCard } from "@/components/folder-card"
import { Lightbox } from "@/components/lightbox"
import { Breadcrumb } from "@/components/breadcrumb"
import { LoadingSpinner } from "@/components/loading-spinner"
import { UploadButton } from "@/components/upload-button"
import type { FolderContent } from "@/lib/google-drive"
import { getImageUrl } from "@/lib/google-drive"

interface GalleryProps {
  initialData: FolderContent
}

export function Gallery({ initialData }: GalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const { files, folders, breadcrumb } = initialData

  const selectedImage = selectedImageIndex !== null ? files[selectedImageIndex] : null

  const currentFolderId = breadcrumb[breadcrumb.length - 1]?.id || 
    process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID || 
    initialData.folders[0]?.id || ''

  function handlePreviousImage() {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1)
    }
  }

  function handleNextImage() {
    if (selectedImageIndex !== null && selectedImageIndex < files.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1)
    }
  }

  const handleUploadComplete = () => {
    // Refresh the page to show new uploads
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="w-full max-w-[2000px] mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Suspense fallback={<LoadingSpinner />}>
          <div className="flex justify-between items-center">
            <Breadcrumb items={breadcrumb} />
            <div className="w-40">
              <UploadButton 
                folderId={currentFolderId} 
                onUploadComplete={handleUploadComplete} 
              />
            </div>
          </div>
          <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
            {folders.map((folder) => (
              <FolderCard key={folder.id} id={folder.id} name={folder.name} />
            ))}
            {files.map((file, index) => (
              <ImageCard
                key={file.id}
                src={getImageUrl(file.id, true)}
                alt={file.name}
                onClick={() => setSelectedImageIndex(index)}
                priority={index < 6}
              />
            ))}
          </div>
          {folders.length === 0 && files.length === 0 && (
            <div className="flex h-[50vh] items-center justify-center">
              <p className="text-center text-muted-foreground">This folder is empty.</p>
            </div>
          )}
        </Suspense>
      </main>
      {selectedImage && (
        <Lightbox
          isOpen={selectedImageIndex !== null}
          onClose={() => setSelectedImageIndex(null)}
          imageUrl={`/api/image/${selectedImage.id}`}
          imageAlt={selectedImage.name}
          onPrevious={handlePreviousImage}
          onNext={handleNextImage}
          hasPrevious={selectedImageIndex !== null && selectedImageIndex > 0}
          hasNext={selectedImageIndex !== null && selectedImageIndex < files.length - 1}
          downloadUrl={`/api/image/${selectedImage.id}?download=true`}
        />
      )}
    </div>
  )
}

