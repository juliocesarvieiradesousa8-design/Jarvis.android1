
import http from "node:http";
import OpenAI from "openai";

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (req.method !== "POST" || req.url !== "/chat") {
    res.writeHead(404);
    return res.end("Not found");
  }

  if (!process.env.OPENAI_API_KEY) {
    res.writeHead(500);
    return res.end("API key not configured");
  }

  try {
    let body = "";
    for await (const chunk of req) body += chunk;

    const { message } = JSON.parse(body);
    if (typeof message !== "string" || !message.trim()) {
      res.writeHead(400);
      return res.end("Message required");
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      instructions: "És o J.A.R.V.I.S., um assistente prestável que responde em português.",
      input: message
    });

    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8"
    });
    res.end(JSON.stringify({ reply: response.output_text }));
  } catch (error) {
    console.error("Erro no pedido:", error.message);
    res.writeHead(500, {
      "Content-Type": "application/json; charset=utf-8"
    });
    res.end(JSON.stringify({ error: "Não foi possível responder." }));
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`JARVIS server running on port ${PORT}`);
});
