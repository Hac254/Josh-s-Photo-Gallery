"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { LoginDialog } from "@/components/login-dialog"

export function UploadButton() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !authToken) return

    const formData = new FormData()
    
    // Get the current folder ID from the URL or use the default folder
    const pathParts = window.location.pathname.split('/')
    const currentFolderId = pathParts[pathParts.length - 1]
    const defaultFolderId = '1FvlMjudh-fspS6yo3vpgaw2CW7naskF7' // Your default folder ID
    
    // Use the current folder ID if it exists, otherwise use the default
    const folderId = currentFolderId && currentFolderId !== '' ? currentFolderId : defaultFolderId
    
    // Now we're sure folderId is a string
    formData.append('folderId', folderId)
    
    console.log('Uploading to folder ID:', folderId)
    
    for (const file of event.target.files) {
      formData.append("files", file)
    }
    
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authToken}`
        },
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Upload failed with status:", response.status, "and message:", errorText)
        throw new Error(`Upload failed: ${errorText}`)
      }

      // Refresh the page or update the gallery
      window.location.reload()
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload files. Please try again.")
    }
  }

  const handleClick = () => {
    if (!authToken) {
      setIsLoginOpen(true)
      return
    }
    // Trigger file input click when authenticated
    fileInputRef.current?.click()
  }

  const handleLogin = (token: string) => {
    setAuthToken(token)
    // Automatically trigger file selection after successful login
    setTimeout(() => {
      fileInputRef.current?.click()
    }, 100)
  }

  return (
    <>
      <Button onClick={handleClick}>
        <Upload className="mr-2 h-4 w-4" />
        Upload Images
      </Button>

      <LoginDialog
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
      />

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />
    </>
  )
} 