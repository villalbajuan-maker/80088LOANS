const { knowledgeChunks, suggestedQuestions } = require("../data/companion-knowledge");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreChunk(question, chunk) {
  const q = normalize(question);
  const content = normalize(`${chunk.title} ${chunk.content} ${chunk.tags.join(" ")}`);
  if (!q || !content) return 0;

  const terms = q.split(" ").filter((term) => term.length > 2);
  let score = 0;

  for (const term of terms) {
    if (content.includes(term)) score += 3;
    if (normalize(chunk.title).includes(term)) score += 2;
    if (chunk.tags.some((tag) => normalize(tag).includes(term))) score += 2;
  }

  if (/collateral|asset[- ]backed|secured/.test(q) && chunk.tags.includes("collateral")) score += 4;
  if (/pipeline|strike|target|source|sourced/.test(q) && chunk.tags.includes("pipeline")) score += 4;
  if (/green river|ward|berry|conley|wycliffe|dennis/.test(q) && chunk.tags.includes("target")) score += 5;
  if (/houston|zip|market|demand/.test(q) && chunk.tags.includes("houston")) score += 4;
  if (/return|term|maturity|20%/.test(q) && chunk.tags.includes("terms")) score += 4;
  if (/risk|mitigation|downside/.test(q) && chunk.tags.includes("risk")) score += 4;

  return score;
}

function retrieve(question, limit = 5) {
  return knowledgeChunks
    .map((chunk) => ({ ...chunk, score: scoreChunk(question, chunk) }))
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function buildFallbackAnswer(question, chunks) {
  if (!chunks.length) {
    return {
      answer:
        "I couldn’t find a strong match in the embedded presentation context yet. Try asking about investor terms, Houston rationale, strike-list targets, Green River, Ward, Berry, Conley, Dennis, or the difference between pipeline and collateral.",
      mode: "fallback",
    };
  }

  const lead = chunks[0];
  const support = chunks.slice(1, 3).map((chunk) => chunk.content);
  const answer = [
    `Based on the presentation context, ${lead.content}`,
    ...support,
    "Where relevant, the deck treats the strike list as sourced pipeline evidence rather than proof that every target is already controlled collateral.",
  ].join(" ");

  return { answer, mode: "fallback" };
}

async function askOpenAI(question, chunks) {
  const context = chunks
    .map(
      (chunk, index) =>
        `[${index + 1}] ${chunk.title}\nSource: ${chunk.sourceLabel}\nSection: ${chunk.sectionId}\nContent: ${chunk.content}`,
    )
    .join("\n\n");

  const system = [
    "You are the investor presentation companion for 80088LOANS.",
    "Answer questions about the Houston Infill Development Portfolio using only the supplied context.",
    "Be concise, investor-facing, and institutionally toned.",
    "Never say returns are guaranteed.",
    "Be careful to distinguish sourced pipeline / strike-list targets from controlled collateral or already-owned assets.",
    "If the context is not enough, say so clearly instead of inventing.",
  ].join(" ");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: [
        { role: "system", content: [{ type: "input_text", text: system }] },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Question: ${question}\n\nContext:\n${context}\n\nAnswer the question using only this context.`,
            },
          ],
        },
      ],
      max_output_tokens: 320,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI error: ${response.status} ${detail}`);
  }

  const json = await response.json();
  return {
    answer: json.output_text || "I couldn't generate an answer from the current context.",
    mode: "openai",
  };
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const question = String(req.body?.question || "").trim();

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const chunks = retrieve(question, 5);
    const citations = chunks.slice(0, 3).map((chunk) => ({
      title: chunk.title,
      sectionId: chunk.sectionId,
      sourceLabel: chunk.sourceLabel,
    }));

    let result;
    if (OPENAI_API_KEY) {
      try {
        result = await askOpenAI(question, chunks);
      } catch (error) {
        result = buildFallbackAnswer(question, chunks);
        result.warning = "OpenAI request failed, so a local context fallback was used.";
      }
    } else {
      result = buildFallbackAnswer(question, chunks);
      result.warning =
        "OPENAI_API_KEY is not configured. The companion is using local retrieval mode.";
    }

    return res.status(200).json({
      ...result,
      citations,
      suggestedQuestions,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Companion request failed",
      detail: error.message,
    });
  }
};
