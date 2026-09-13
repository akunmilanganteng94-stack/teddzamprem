export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const total = Number(req.body?.total);

    if (!Number.isInteger(total) || total < 1 || total > 5) {
      return res.status(400).json({
        success: false,
        message: "Total akun harus antara 1 sampai 5",
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    try {
      const upstream = await fetch("https://am.dapjisync.my.id/api/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "FREE",
        },
        body: JSON.stringify({ total }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const text = await upstream.text();

      let data: any;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        return res.status(502).json({
          success: false,
          message: "Server AM mengembalikan response yang bukan JSON",
          status: upstream.status,
        });
      }

      if (!upstream.ok) {
        return res.status(upstream.status >= 400 && upstream.status < 500 ? upstream.status : 502).json({
          success: false,
          message: data?.message || data?.error || `API AM error (${upstream.status})`,
          data,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Order berhasil diproses",
        data,
      });
    } catch (error: any) {
      clearTimeout(timeout);
      if (error?.name === "AbortError") {
        return res.status(504).json({
          success: false,
          message: "Request ke server AM timeout. Silakan coba lagi.",
        });
      }
      return res.status(502).json({
        success: false,
        message: "Tidak dapat terhubung ke server AM",
        error: error?.message || String(error),
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan internal server",
      error: error?.message || String(error),
    });
  }
}
