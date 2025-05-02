import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const COHERE_API_KEY = "hi6zCXipvKWEQAd2ajHuSQHB9Lk9avqJ6GMWJcJn";

export async function generatePost(prompt) {
  const response = await axios.post(
    "https://api.cohere.ai/v1/generate",
    {
      model: "command",
      prompt,
      max_tokens: 600, // Respuestas más cortas
      temperature: 0.8,
    },
    {
      headers: {
        "Authorization": `Bearer ${COHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data.generations[0]?.text?.trim() || "";
}