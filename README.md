# MMMS App Engine

NestJS backend for building, deploying, and automating MMMS applications.

## Setup

```bash
npm install
npm run build
npm start
```

The API listens on `PORT` (default `3000`) under the `/api` prefix.

## Built-in connectors

All connector routes proxy through a provider gateway so API credentials and
provider-specific behavior are not embedded in generated apps.

| Connector | Route |
| --- | --- |
| Send email | `POST /api/connectors/email/send` |
| Upload file | `POST /api/connectors/files/upload` |
| Invoke LLM | `POST /api/connectors/llm/invoke` |
| Generate image | `POST /api/connectors/images/generate` |
| Generate video | `POST /api/connectors/videos/generate` |
| Generate speech | `POST /api/connectors/speech/generate` |
| Extract uploaded file data | `POST /api/connectors/files/extract` |
| Send WhatsApp message | `POST /api/connectors/whatsapp/send` |
| WhatsApp webhook | `GET/POST /api/connectors/whatsapp/webhook` |
| Send Telegram message | `POST /api/connectors/telegram/send` |
| Telegram webhook | `POST /api/connectors/telegram/webhook` |

Configure:

```dotenv
CONNECTOR_GATEWAY_URL=https://connectors.example.com
CONNECTOR_GATEWAY_API_KEY=replace-me
WHATSAPP_VERIFY_TOKEN=replace-me
```

## Cloudflare connector gateway

The deployable gateway is in `connector-gateway/`. It uses Cloudflare R2 for
uploaded/generated files and Azure OpenAI for LLM, image, speech, video, and
file-extraction requests.

1. Copy `connector-gateway/.dev.vars.example` to `.dev.vars` and enter your
   secrets.
2. Log in with `npx wrangler login`.
3. Deploy with `npm run gateway:deploy`.
4. Copy the deployed `workers.dev` URL into the backend's
   `CONNECTOR_GATEWAY_URL`.
5. Set the same random value for the Worker's `GATEWAY_API_KEY` secret and the
   backend's `CONNECTOR_GATEWAY_API_KEY`.

Production secrets should be added with `npx wrangler secret put SECRET_NAME`.
The Worker configuration automatically provisions its R2 binding on deploy.

Azure video generation is asynchronous. The initial request returns a job ID
and `statusPath`; poll that path until Azure reports completion.

Connector request bodies are forwarded as JSON. File upload requests should
include the file name, MIME type, and base64 data. Extraction requests should
include an uploaded file URL and a JSON schema. Generation responses return
the gateway response, including generated file URLs.
