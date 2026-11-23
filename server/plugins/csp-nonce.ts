import { useServerHooks } from 'nuxt/server';

const SCRIPT_TAG_RE = /<script(?![^>]*\bnonce=)[^>]*>/g;

/**
 * The security-headers middleware generates a per-request CSP nonce and
 * stores it on event.context.cspNonce. Nuxt's renderer only applies it to
 * bootstrap/payload scripts it emits itself; inline scripts contributed by
 * modules (color-mode init, __NUXT__.config payload, JSON-LD, etc.) are
 * rendered through unhead without a nonce and get blocked by script-src.
 * Stamp the nonce onto every remaining script tag in the rendered document.
 */
export default defineNitroPlugin(() => {
  useServerHooks().hook('render:html', (html, { event }) => {
    const nonce = event.context.cspNonce as string | undefined;
    if (!nonce) return;

    const stamp = (chunk: string) =>
      chunk.includes('<script')
        ? chunk.replace(SCRIPT_TAG_RE, (tag) => tag.replace('<script', `<script nonce="${nonce}"`))
        : chunk;

    html.head = html.head.map(stamp);
    html.bodyPrepend = html.bodyPrepend.map(stamp);
    html.body = html.body.map(stamp);
    html.bodyAppend = html.bodyAppend.map(stamp);
  });
});
