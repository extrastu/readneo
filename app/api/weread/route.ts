import { NextRequest, NextResponse } from 'next/server'
import { wereadFetch } from '@/lib/weread'

export async function POST(request: NextRequest) {
  try {
    const { apiKey, apiName, ...params } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key is required' }, { status: 400 })
    }

    if (!apiName) {
      return NextResponse.json({ error: 'API name is required' }, { status: 400 })
    }

    const data = await wereadFetch(apiKey, apiName, params)
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
