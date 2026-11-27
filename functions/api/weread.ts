import { wereadFetch } from '../../lib/weread'

interface PagesFunctionContext {
  request: Request
}

/**
 * 构造统一的 JSON 响应对象
 * @param payload 响应体数据
 * @param status HTTP 状态码，默认为 200
 * @returns 带 application/json 头的 Response 对象
 */
function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

/**
 * Cloudflare Pages Function：代理转发微信读书 Skill API 请求
 * 与 app/api/weread/route.ts 保持相同的参数校验与错误语义
 * @param context Cloudflare Pages 请求上下文
 * @returns 微信读书网关返回的 JSON 响应或错误信息
 */
export async function onRequestPost(context: PagesFunctionContext): Promise<Response> {
  try {
    let body: Record<string, unknown>
    try {
      body = (await context.request.json()) as Record<string, unknown>
    } catch {
      return jsonResponse({ error: 'Invalid JSON request body' }, 400)
    }

    const { apiKey, apiName, ...params } = body

    if (!apiKey || typeof apiKey !== 'string') {
      return jsonResponse({ error: 'API Key is required' }, 400)
    }

    if (!apiName || typeof apiName !== 'string') {
      return jsonResponse({ error: 'API name is required' }, 400)
    }

    const data = await wereadFetch(apiKey, apiName, params)
    return jsonResponse(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return jsonResponse({ error: message }, 502)
  }
}
