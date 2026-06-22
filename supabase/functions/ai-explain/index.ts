import Anthropic from "npm:@anthropic-ai/sdk@0.27.3";
import { corsHeaders } from "../_shared/cors.ts";

const client = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { question, correctAnswer, chosenAnswer } = await req.json();

    if (!question || !correctAnswer) {
      return new Response(
        JSON.stringify({ error: "question and correctAnswer are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 130,
      system:
        "You are a South African K53 driving instructor. Explain in 2-3 short sentences why the correct answer is right. Reference the specific rule or section from the National Road Traffic Act (NRTA) or K53 manual where relevant. Use SA context (km/h, rand, SA place names). Be encouraging — the learner is studying hard. Plain English only, no bullet points.",
      messages: [
        {
          role: "user",
          content: `Question: ${question}\nCorrect answer: ${correctAnswer}\nLearner chose: ${chosenAnswer ?? "not provided"}`,
        },
      ],
    });

    const text =
      message.content[0]?.type === "text"
        ? message.content[0].text.trim()
        : null;

    if (!text) throw new Error("Empty response from Claude");

    return new Response(JSON.stringify({ explanation: text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[ai-explain]", err);
    return new Response(
      JSON.stringify({ error: "Could not generate explanation" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
