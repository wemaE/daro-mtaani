export function middleware(request: Request) {
  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/n8n/')) {
    const sharedSecret = process.env.N8N_SHARED_SECRET;
    const clientSecret = request.headers.get('x-n8n-shared-secret');

    if (!sharedSecret || clientSecret !== sharedSecret) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: invalid or missing n8n shared secret' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }
  }
}
