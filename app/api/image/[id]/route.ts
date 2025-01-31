import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken } from '@/lib/google-drive'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accessToken = await getAccessToken()
    const isThumbnail = request.nextUrl.searchParams.get('thumbnail') === 'true'
    
    // Different endpoint for thumbnails
    const url = isThumbnail
      ? `https://www.googleapis.com/drive/v3/files/${params.id}?alt=media&fields=thumbnailLink`
      : `https://www.googleapis.com/drive/v3/files/${params.id}?alt=media`

    const imageResponse = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image')
    }

    const headers = new Headers()
    headers.set('Content-Type', imageResponse.headers.get('Content-Type') || 'image/jpeg')
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')

    return new NextResponse(imageResponse.body, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Error fetching image:', error)
    return new NextResponse('Failed to load image', { status: 500 })
  }
} 