import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

function backendUrl(path: string[], search: string) {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) throw new Error('Falta la variable de entorno requerida: API_URL');
  return `${apiUrl}/api/${path.join('/')}${search}`;
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('connection');
  const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer();
  const response = await fetch(backendUrl(path, request.nextUrl.search), {
    method: request.method,
    headers,
    body,
    cache: 'no-store',
  });
  return new Response(response.body, { status: response.status, headers: { 'Content-Type': response.headers.get('content-type') || 'application/json' } });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
