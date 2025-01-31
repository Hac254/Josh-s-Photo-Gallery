import { NextRequest, NextResponse } from 'next/server'
import { signToken } from '@/lib/jwt'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

if (!ADMIN_PASSWORD) {
  throw new Error('Missing ADMIN_PASSWORD environment variable')
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    const token = await signToken({ role: 'admin' })
    return NextResponse.json({ token })
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
} 