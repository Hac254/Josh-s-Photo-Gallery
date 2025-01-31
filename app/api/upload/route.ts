import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken } from '@/lib/google-drive'

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024
// Maximum total upload size (50MB)
const MAX_TOTAL_SIZE = 50 * 1024 * 1024
// Allowed file types
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

// New way to configure the route
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const accessToken = await getAccessToken()
    const formData = await request.formData()
    const folderId = formData.get('folderId') as string
    const files = formData.getAll('files') as File[]

    // Validate folder ID
    if (!folderId) {
      return NextResponse.json(
        { success: false, error: 'No folder ID provided' },
        { status: 400 }
      )
    }

    // Validate files
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      )
    }

    // Check total size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0)
    if (totalSize > MAX_TOTAL_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Total upload size exceeds limit' },
        { status: 400 }
      )
    }

    // Validate each file
    for (const file of files) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: `File ${file.name} exceeds size limit` },
          { status: 400 }
        )
      }

      // Check file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: `File ${file.name} has unsupported type` },
          { status: 400 }
        )
      }
    }

    const uploadPromises = files.map(async (file) => {
      try {
        // Create file metadata
        const metadata = {
          name: file.name,
          parents: [folderId],
          mimeType: file.type,
        }

        const metadataResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(metadata),
        })

        if (!metadataResponse.ok) {
          throw new Error(`Failed to create metadata for ${file.name}`)
        }

        const { id } = await metadataResponse.json()

        // Upload file content with progress tracking
        const arrayBuffer = await file.arrayBuffer()
        const uploadResponse = await fetch(
          `https://www.googleapis.com/upload/drive/v3/files/${id}?uploadType=media`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': file.type,
            },
            body: arrayBuffer,
          }
        )

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload content for ${file.name}`)
        }

        return uploadResponse.json()
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error)
        throw error
      }
    })

    const results = await Promise.allSettled(uploadPromises)
    const errors = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map(result => result.reason.message)

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, errors },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
} 