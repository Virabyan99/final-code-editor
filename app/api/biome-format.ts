import { format } from "@biomejs/biome";

export default async function handler(req, res) {
  const { code } = req.body;
  try {
    const formattedCode = await format(code, {
      indentWidth: 2,
      lineWidth: 80,
      quoteStyle: "double",
      trailingComma: "all",
    });
    res.status(200).json({ formattedCode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}