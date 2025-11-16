export default async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: "URL do PDF é obrigatória." });
    }

    const userAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

    const response = await fetch(url, {
      headers: { "User-Agent": userAgent },
    });

    if (!response.ok) {
      return res.status(500).json({ error: "Erro ao baixar o PDF original." });
    }

    const pdfBuffer = Buffer.from(await response.arrayBuffer());

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Cache-Control", "public, max-age=86400");

    return res.send(pdfBuffer);
  } catch (err) {
    console.error("Erro no proxy:", err);
    return res.status(500).json({ error: "Erro interno no servidor proxy." });
  }
}
