"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface UploadButtonProps {
  folderId: string
  onUploadComplete: () => void
}

export function UploadButton({ folderId, onUploadComplete }: UploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('folderId', folderId)

    // Add all files to formData
    Array.from(files).forEach(file => {
      formData.append('files', file)
    })

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      toast({
        title: "Success",
        description: "Files uploaded successfully",
      })
      
      onUploadComplete()
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="relative">
      <input
        type="file"
        multiple
        accept="image/*"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => handleUpload(e.target.files)}
        disabled={isUploading}
      />
      <Button
        variant="outline"
        size="sm"
        className={`w-full ${isUploading ? 'opacity-50' : ''}`}
        disabled={isUploading}
      >
        <Upload className="h-4 w-4 mr-2" />
        {isUploading ? 'Uploading...' : 'Upload Images'}
      </Button>
    </div>
  )
} 