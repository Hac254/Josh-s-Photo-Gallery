import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken } from '@/lib/google-drive'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accessToken = await getAccessToken()
    
    // First, get the file metadata to verify access and get file info
    const metadataUrl = `https://www.googleapis.com/drive/v3/files/${params.id}?fields=id,mimeType`
    const metadataResponse = await fetch(metadataUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!metadataResponse.ok) {
      console.error('Metadata fetch failed:', await metadataResponse.text())
      throw new Error('Failed to verify file access')
    }

    const metadata = await metadataResponse.json()
    
    // Get the actual file content
    const url = `https://www.googleapis.com/drive/v3/files/${params.id}?alt=media`
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      console.error('File fetch failed:', await response.text())
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    // Get content type from metadata or response headers
    const contentType = metadata.mimeType || response.headers.get('content-type') || 'image/jpeg'

    // Stream the response
    const headers = new Headers({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    })

    return new NextResponse(response.body, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Error in image API route:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to load image',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
} 