import { NextRequest, NextResponse } from 'next/server'
import { wereadFetch } from '@/lib/weread'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { apiKey, apiName, ...params } = body

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json({ error: 'API Key is required' }, { status: 400 })
    }

    if (!apiName || typeof apiName !== 'string') {
      return NextResponse.json({ error: 'API name is required' }, { status: 400 })
    }

    console.log('[v0] WeRead request:', apiName, JSON.stringify(params))

    const data = await wereadFetch(apiKey, apiName, params)

    console.log('[v0] WeRead response keys:', Object.keys(data))

    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[v0] WeRead API error:', message)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
