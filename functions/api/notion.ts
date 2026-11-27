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
 * Cloudflare Pages Function：代理转发 Notion 页面创建请求
 * 与 app/api/notion/route.ts 保持相同的请求校验与错误透传逻辑
 * @param context Cloudflare Pages 请求上下文
 * @returns Notion API 返回的 JSON 响应或错误信息
 */
export async function onRequestPost(context: PagesFunctionContext): Promise<Response> {
  try {
    let body: Record<string, unknown>
    try {
      body = (await context.request.json()) as Record<string, unknown>
    } catch {
      return jsonResponse({ error: 'Invalid JSON request body' }, 400)
    }

    const { token, databaseId, properties } = body

    if (!token || !databaseId || !properties) {
      return jsonResponse(
        { error: 'Missing required fields: token, databaseId, properties' },
        400
      )
    }

    const res = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${String(token)}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties,
      }),
    })

    const data = (await res.json()) as Record<string, unknown>

    if (!res.ok) {
      return jsonResponse(
        { error: (data.message as string) || `Notion API error: ${res.status}` },
        res.status
      )
    }

    return jsonResponse(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return jsonResponse({ error: message }, 502)
  }
}
