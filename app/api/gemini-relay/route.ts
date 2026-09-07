export const runtime = 'nodejs'
export const preferredRegion = 'iad1'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { model, contents, generationConfig } = body

    if (!model || !contents) {
      return Response.json({ error: 'Missing model or contents' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'Relay misconfigured: no API key' }, { status: 500 })
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          ...(generationConfig ? { generationConfig } : {}),
        }),
      }
    )

    const data = await geminiRes.json()

    return Response.json(data, { status: geminiRes.status })
  } catch (err: any) {
    return Response.json({ error: `Relay exception: ${err.message}` }, { status: 500 })
  }
}
