<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/79a76c20-658c-46ea-897b-7d07bffbfe63

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Vercel deployment

This project includes a Vercel Serverless Function at `api/order-am.ts` for the
Alight Motion bulk API. Deploy the project root to Vercel and keep the default
build command (`npm run build`) and output directory (`dist`).

The browser calls `/api/order-am`; the Vercel function forwards the request to
`https://am.dapjisync.my.id/api/bulk` with the `X-API-Key: FREE` header.
