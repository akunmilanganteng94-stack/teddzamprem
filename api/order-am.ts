/**
 * Vercel Serverless Function
 * POST /api/order-am
 * Proxies bulk AM orders to the upstream API without exposing the upstream
 * request details to the browser.
 */

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed',
    });
  }

  try {
    const total = Number(req.body?.total);

    if (!Number.isInteger(total) || total < 1 || total > 5) {
      return res.status(400).json({
        success: false,
        message: 'Total akun harus antara 1 sampai 5',
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const upstream = await fetch('https://am.dapjisync.my.id/api/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'FREE',
        },
        body: JSON.stringify({ total }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Always read as text first. The upstream service can occasionally
      // return HTML/plain text; parsing directly with response.json() would
      // cause "Unexpected token ... is not valid JSON" in the browser.
      const text = await upstream.text();
      let data: any;

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        return res.status(502).json({
          success: false,
          message: 'Server AM mengembalikan response yang bukan JSON.',
          upstreamStatus: upstream.status,
        });
      }

      if (!upstream.ok) {
        return res.status(502).json({
          success: false,
          message:
            data?.message ||
            data?.error ||
            `Server AM menolak request (status ${upstream.status}).`,
          upstreamStatus: upstream.status,
          data,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Order berhasil diproses oleh server AM.',
        data,
      });
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error?.name === 'AbortError') {
        return res.status(504).json({
          success: false,
          message: 'Request ke server AM timeout. Silakan coba lagi.',
        });
      }

      console.error('AM upstream error:', error);
      return res.status(502).json({
        success: false,
        message: 'Tidak dapat terhubung ke server AM.',
      });
    }
  } catch (error: any) {
    console.error('Order API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan internal server.',
    });
  }
}
