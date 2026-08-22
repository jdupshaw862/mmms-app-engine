interface Env {
  FILES: R2Bucket;
  GATEWAY_API_KEY: string;
  AZURE_OPENAI_ENDPOINT: string;
  AZURE_OPENAI_API_KEY: string;
  AZURE_OPENAI_TEXT_MODEL: string;
  AZURE_OPENAI_IMAGE_MODEL: string;
  AZURE_OPENAI_SPEECH_MODEL: string;
  AZURE_OPENAI_VIDEO_MODEL: string;
  RESEND_API_KEY: string;
  EMAIL_FROM: string;
  WHATSAPP_ACCESS_TOKEN: string;
  WHATSAPP_PHONE_NUMBER_ID: string;
  WHATSAPP_GRAPH_API_VERSION: string;
  TELEGRAM_BOT_TOKEN: string;
  AGENT_WEBHOOK_URL?: string;
  AGENT_WEBHOOK_SECRET?: string;
}

type JsonObject = Record<string, unknown>;

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);

      if (request.method === 'GET' && url.pathname.startsWith('/files/')) {
        return getFile(url.pathname.slice('/files/'.length), env);
      }

      authorize(request, env);

      if (
        request.method === 'GET' &&
        url.pathname.startsWith('/videos/status/')
      ) {
        return getVideoStatus(
          url.pathname.slice('/videos/status/'.length),
          request.url,
          env,
        );
      }

      if (request.method !== 'POST') {
        throw new HttpError(405, 'Method not allowed');
      }

      const body = await readJson(request);
      switch (url.pathname) {
        case '/email/send':
          return sendEmail(body, env);
        case '/files/upload':
          return uploadFile(body, request.url, env);
        case '/llm/invoke':
          return invokeLlm(body, env);
        case '/images/generate':
          return generateImage(body, request.url, env);
        case '/videos/generate':
          return generateVideo(body, env);
        case '/speech/generate':
          return generateSpeech(body, request.url, env);
        case '/files/extract':
          return extractFileData(body, request.url, env);
        case '/whatsapp/send':
          return sendWhatsApp(body, env);
        case '/whatsapp/webhook':
          return forwardAgentEvent('whatsapp', body, env);
        case '/telegram/send':
          return sendTelegram(body, env);
        case '/telegram/webhook':
          return forwardAgentEvent('telegram', body, env);
        default:
          throw new HttpError(404, 'Connector route not found');
      }
    } catch (error) {
      if (error instanceof HttpError) {
        return json({ error: error.message }, error.status);
      }
      console.error(error);
      return json({ error: 'Internal connector error' }, 500);
    }
  },
} satisfies ExportedHandler<Env>;

function authorize(request: Request, env: Env) {
  if (!env.GATEWAY_API_KEY) {
    throw new HttpError(503, 'GATEWAY_API_KEY is not configured');
  }
  if (request.headers.get('Authorization') !== `Bearer ${env.GATEWAY_API_KEY}`) {
    throw new HttpError(401, 'Invalid gateway credentials');
  }
}

async function readJson(request: Request): Promise<JsonObject> {
  try {
    const value: unknown = await request.json();
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error();
    }
    return value as JsonObject;
  } catch {
    throw new HttpError(400, 'A JSON object request body is required');
  }
}

async function sendEmail(body: JsonObject, env: Env) {
  requireEnv(env.RESEND_API_KEY, 'RESEND_API_KEY');
  requireEnv(env.EMAIL_FROM, 'EMAIL_FROM');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: providerHeaders(env.RESEND_API_KEY),
    body: JSON.stringify({
      from: optionalString(body.from) ?? env.EMAIL_FROM,
      to: requiredStringOrArray(body.to, 'to'),
      subject: requiredString(body.subject, 'subject'),
      html: requiredString(body.html, 'html'),
      reply_to: optionalString(body.replyTo),
    }),
  });
  return proxyJson(response, 'Email provider');
}

async function uploadFile(body: JsonObject, requestUrl: string, env: Env) {
  const fileName = sanitizeFileName(requiredString(body.fileName, 'fileName'));
  const mimeType = requiredString(body.mimeType, 'mimeType');
  const bytes = decodeBase64(requiredString(body.data, 'data'));
  const key = `${crypto.randomUUID()}/${fileName}`;

  await env.FILES.put(key, bytes, {
    httpMetadata: { contentType: mimeType },
    customMetadata: { originalName: fileName },
  });

  return json({
    id: key,
    url: `${new URL(requestUrl).origin}/files/${encodeURIComponent(key)}`,
    fileName,
    mimeType,
    size: bytes.byteLength,
  });
}

async function getFile(encodedKey: string, env: Env) {
  const object = await env.FILES.get(decodeURIComponent(encodedKey));
  if (!object) {
    throw new HttpError(404, 'File not found');
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('ETag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  return new Response(object.body, { headers });
}

async function invokeLlm(body: JsonObject, env: Env) {
  const payload: JsonObject = {
    ...body,
    model: optionalString(body.model) ?? env.AZURE_OPENAI_TEXT_MODEL,
    input: body.input ?? requiredString(body.prompt, 'prompt'),
  };
  delete payload.prompt;
  return azureJson('responses', payload, env);
}

async function generateImage(
  body: JsonObject,
  requestUrl: string,
  env: Env,
) {
  const response = await azureRequest(
    'images/generations',
    {
      ...body,
      model: optionalString(body.model) ?? env.AZURE_OPENAI_IMAGE_MODEL,
      prompt: requiredString(body.prompt, 'prompt'),
    },
    env,
  );
  const result = await parseProviderJson(response, 'Azure OpenAI');
  const data = Array.isArray(result.data) ? result.data : [];
  const images = await Promise.all(
    data.map(async (item, index) => {
      if (!isObject(item)) return item;
      if (typeof item.b64_json !== 'string') return item;

      const format = optionalString(body.output_format) ?? 'png';
      const key = `${crypto.randomUUID()}/generated-${index}.${format}`;
      await env.FILES.put(key, decodeBase64(item.b64_json), {
        httpMetadata: { contentType: `image/${format}` },
      });
      const { b64_json: _, ...metadata } = item;
      return {
        ...metadata,
        url: `${new URL(requestUrl).origin}/files/${encodeURIComponent(key)}`,
      };
    }),
  );
  return json({ ...result, data: images });
}

async function generateVideo(body: JsonObject, env: Env) {
  const result = await azureJsonValue(
    'video/generations/jobs',
    {
      ...body,
      model: optionalString(body.model) ?? env.AZURE_OPENAI_VIDEO_MODEL,
      prompt: requiredString(body.prompt, 'prompt'),
      width: body.width ?? 1280,
      height: body.height ?? 720,
      n_seconds: body.n_seconds ?? 5,
      n_variants: body.n_variants ?? 1,
    },
    env,
  );
  const jobId = requiredString(result.id, 'Azure video job id');
  return json({
    ...result,
    jobId,
    statusPath: `/api/connectors/videos/${encodeURIComponent(jobId)}`,
  });
}

async function getVideoStatus(jobId: string, requestUrl: string, env: Env) {
  if (!jobId) throw new HttpError(400, 'Video job id is required');
  const result = await azureJsonValue(
    `video/generations/jobs/${encodeURIComponent(jobId)}`,
    null,
    env,
    'GET',
  );
  const generations = Array.isArray(result.generations)
    ? result.generations
    : [];
  const completed =
    result.status === 'succeeded' || result.status === 'completed';

  if (!completed || generations.length === 0) {
    return json(result);
  }

  const videos = await Promise.all(
    generations.map(async (generation) => {
      if (!isObject(generation) || typeof generation.id !== 'string') {
        return generation;
      }

      const contentResponse = await azureRequest(
        `video/generations/${encodeURIComponent(generation.id)}/content`,
        null,
        env,
        'GET',
      );
      if (!contentResponse.ok) {
        await throwProviderError(contentResponse, 'Azure OpenAI');
      }

      const key = `${jobId}/${generation.id}.mp4`;
      await env.FILES.put(key, await contentResponse.arrayBuffer(), {
        httpMetadata: {
          contentType:
            contentResponse.headers.get('Content-Type') ?? 'video/mp4',
        },
      });
      return {
        ...generation,
        url: `${new URL(requestUrl).origin}/files/${encodeURIComponent(key)}`,
      };
    }),
  );
  return json({ ...result, generations: videos });
}

async function generateSpeech(
  body: JsonObject,
  requestUrl: string,
  env: Env,
) {
  const format = optionalString(body.response_format) ?? 'mp3';
  const response = await azureRequest(
    'audio/speech',
    {
      ...body,
      model: optionalString(body.model) ?? env.AZURE_OPENAI_SPEECH_MODEL,
      input: requiredString(body.input, 'input'),
      voice: optionalString(body.voice) ?? 'alloy',
      response_format: format,
    },
    env,
  );
  if (!response.ok) await throwProviderError(response, 'Azure OpenAI');

  const key = `${crypto.randomUUID()}/speech.${format}`;
  await env.FILES.put(key, await response.arrayBuffer(), {
    httpMetadata: { contentType: response.headers.get('Content-Type') ?? 'audio/mpeg' },
  });
  return json({
    url: `${new URL(requestUrl).origin}/files/${encodeURIComponent(key)}`,
    format,
  });
}

async function extractFileData(
  body: JsonObject,
  requestUrl: string,
  env: Env,
) {
  const fileUrl = requiredString(body.fileUrl, 'fileUrl');
  const schema = body.schema;
  if (!isObject(schema)) {
    throw new HttpError(400, 'schema must be a JSON schema object');
  }

  let parsedFileUrl: URL;
  try {
    parsedFileUrl = new URL(fileUrl);
  } catch {
    throw new HttpError(400, 'fileUrl must be a valid URL');
  }
  const gatewayUrl = new URL(requestUrl);
  if (
    parsedFileUrl.origin !== gatewayUrl.origin ||
    !parsedFileUrl.pathname.startsWith('/files/')
  ) {
    throw new HttpError(400, 'fileUrl must be an uploaded gateway file');
  }

  const fileResponse = await fetch(parsedFileUrl);
  if (!fileResponse.ok) {
    throw new HttpError(400, 'Unable to download fileUrl');
  }
  const bytes = await fileResponse.arrayBuffer();
  if (bytes.byteLength > 10 * 1024 * 1024) {
    throw new HttpError(413, 'Files larger than 10 MB are not supported');
  }

  const contentType =
    fileResponse.headers.get('Content-Type') ?? 'application/octet-stream';
  const fileName =
    optionalString(body.fileName) ?? new URL(fileUrl).pathname.split('/').pop() ?? 'upload';
  const result = await azureJsonValue(
    'responses',
    {
      model: optionalString(body.model) ?? env.AZURE_OPENAI_TEXT_MODEL,
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_file',
              filename: fileName,
              file_data: `data:${contentType};base64,${encodeBase64(bytes)}`,
            },
            {
              type: 'input_text',
              text: optionalString(body.prompt) ?? 'Extract the file data using the provided JSON schema.',
            },
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'extracted_data',
          schema,
          strict: true,
        },
      },
    },
    env,
  );
  return json(result);
}

async function sendWhatsApp(body: JsonObject, env: Env) {
  requireEnv(env.WHATSAPP_ACCESS_TOKEN, 'WHATSAPP_ACCESS_TOKEN');
  requireEnv(env.WHATSAPP_PHONE_NUMBER_ID, 'WHATSAPP_PHONE_NUMBER_ID');
  const version = env.WHATSAPP_GRAPH_API_VERSION || 'v23.0';
  const response = await fetch(
    `https://graph.facebook.com/${version}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: providerHeaders(env.WHATSAPP_ACCESS_TOKEN),
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: requiredString(body.to, 'to'),
        type: 'text',
        text: { body: requiredString(body.message, 'message') },
      }),
    },
  );
  return proxyJson(response, 'WhatsApp');
}

async function sendTelegram(body: JsonObject, env: Env) {
  requireEnv(env.TELEGRAM_BOT_TOKEN, 'TELEGRAM_BOT_TOKEN');
  const response = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: requiredString(body.chatId, 'chatId'),
        text: requiredString(body.message, 'message'),
        parse_mode: optionalString(body.parseMode),
      }),
    },
  );
  return proxyJson(response, 'Telegram');
}

async function forwardAgentEvent(
  platform: 'whatsapp' | 'telegram',
  body: JsonObject,
  env: Env,
) {
  if (!env.AGENT_WEBHOOK_URL) {
    throw new HttpError(503, 'AGENT_WEBHOOK_URL is not configured');
  }
  const response = await fetch(env.AGENT_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(env.AGENT_WEBHOOK_SECRET
        ? { Authorization: `Bearer ${env.AGENT_WEBHOOK_SECRET}` }
        : {}),
    },
    body: JSON.stringify({ platform, event: body }),
  });
  return proxyJson(response, 'Agent webhook');
}

async function azureJson(
  path: string,
  payload: JsonObject | null,
  env: Env,
  method: 'GET' | 'POST' = 'POST',
) {
  return json(await azureJsonValue(path, payload, env, method));
}

async function azureJsonValue(
  path: string,
  payload: JsonObject | null,
  env: Env,
  method: 'GET' | 'POST' = 'POST',
) {
  return parseProviderJson(
    await azureRequest(path, payload, env, method),
    'Azure OpenAI',
  );
}

async function azureRequest(
  path: string,
  payload: JsonObject | null,
  env: Env,
  method: 'GET' | 'POST' = 'POST',
) {
  requireEnv(env.AZURE_OPENAI_ENDPOINT, 'AZURE_OPENAI_ENDPOINT');
  requireEnv(env.AZURE_OPENAI_API_KEY, 'AZURE_OPENAI_API_KEY');
  const endpoint = env.AZURE_OPENAI_ENDPOINT.replace(/\/$/, '');
  return fetch(`${endpoint}/openai/v1/${path}?api-version=preview`, {
    method,
    headers: {
      'api-key': env.AZURE_OPENAI_API_KEY,
      'Content-Type': 'application/json',
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });
}

async function proxyJson(response: Response, provider: string) {
  return json(await parseProviderJson(response, provider), response.status);
}

async function parseProviderJson(
  response: Response,
  provider: string,
): Promise<JsonObject> {
  if (!response.ok) await throwProviderError(response, provider);
  const value: unknown = await response.json();
  if (!isObject(value)) {
    throw new HttpError(502, `${provider} returned an invalid response`);
  }
  return value;
}

async function throwProviderError(response: Response, provider: string): Promise<never> {
  const detail = (await response.text()).slice(0, 500);
  throw new HttpError(
    502,
    `${provider} request failed (${response.status})${detail ? `: ${detail}` : ''}`,
  );
}

function providerHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

function requiredString(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new HttpError(400, `${field} is required`);
  }
  return value;
}

function requiredStringOrArray(value: unknown, field: string) {
  if (
    (typeof value === 'string' && value.trim()) ||
    (Array.isArray(value) &&
      value.length > 0 &&
      value.every((item) => typeof item === 'string' && item.trim()))
  ) {
    return value;
  }
  throw new HttpError(400, `${field} must be an email address or array`);
}

function optionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function requireEnv(value: string | undefined, name: string): asserts value is string {
  if (!value) throw new HttpError(503, `${name} is not configured`);
}

function isObject(value: unknown): value is JsonObject {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function sanitizeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200);
}

function decodeBase64(value: string) {
  try {
    const binary = atob(value.replace(/^data:[^;]+;base64,/, ''));
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    throw new HttpError(400, 'data must be valid base64');
  }
}

function encodeBase64(value: ArrayBuffer) {
  const bytes = new Uint8Array(value);
  let binary = '';
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

function json(value: unknown, status = 200) {
  return Response.json(value, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}
