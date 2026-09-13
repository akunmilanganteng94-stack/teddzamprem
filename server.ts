import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "TEDDZA MPREM" });
  });

  // Proxy API for Alight Motion bulk orders
  app.post("/api/order-am", async (req, res) => {
    try {
      const { total } = req.body;
      const parsedTotal = Number(total);

      if (!parsedTotal || parsedTotal < 1 || parsedTotal > 5 || !Number.isInteger(parsedTotal)) {
        return res.status(400).json({
          success: false,
          message: "Total akun harus antara 1 sampai 5",
        });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      try {
        const apiResponse = await fetch("https://am.dapjisync.my.id/api/bulk", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": "FREE",
          },
          body: JSON.stringify({ total: parsedTotal }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const responseText = await apiResponse.text();
        let responseData: any = {};
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = { raw: responseText };
        }

        if (!apiResponse.ok) {
          console.error("External AM API error status:", apiResponse.status, responseData);
          return res.status(apiResponse.status >= 400 && apiResponse.status < 500 ? apiResponse.status : 502).json({
            success: false,
            message: responseData.message || responseData.error || `Gagal dari server penyedia (status ${apiResponse.status})`,
            rawResponse: responseData,
          });
        }

        return res.json({
          success: true,
          message: "Order berhasil diproses oleh server AM",
          data: responseData,
        });
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === "AbortError") {
          return res.status(504).json({
            success: false,
            message: "Request ke server penyedia AM timeout. Silakan coba lagi.",
          });
        }
        console.error("Fetch error to AM API:", fetchError);
        return res.status(502).json({
          success: false,
          message: "Tidak dapat terhubung ke server penyedia AM.",
          error: fetchError.message || String(fetchError),
        });
      }
    } catch (err: any) {
      console.error("Internal server error:", err);
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan internal server.",
        error: err.message,
      });
    }
  });

  // Vite development middleware vs production static files
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TEDDZA MPREM server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
