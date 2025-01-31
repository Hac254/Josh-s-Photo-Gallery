import { testDriveConnection } from '@/lib/google-drive'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const result = await testDriveConnection()
    return NextResponse.json({ success: true, result })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 