const USE_OPENAI = true; // 🔁 switch to local later

export async function askAI(messages) {
  if (!USE_OPENAI) {
    return localLLM(messages);
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
    }),
  });

  const data = await res.json();
  return data.choices[0].message.content;
}

async function localLLM(messages) {
  // Placeholder for Ollama / llama.cpp / LM Studio
  return "Local AI is processing your request…";
}
