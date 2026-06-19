import { generateText } from "ai";
import {
  GENERATE_DESCRIPTION_SYSTEM_PROMPT,
  REPHRASE_TITLE_SYSTEM_PROMPT,
} from "./prompt";

export type AIAdminAction = "rephrase-title" | "generate-desc";

export const generateAIAdminContent = async (
  action: AIAdminAction,
  payload: { title?: string; unit?: string; description?: string }
) => {
  if (action === "rephrase-title") {
    const { text } = await generateText({
      model: "google/gemini-2.5-flash-lite",
      system: REPHRASE_TITLE_SYSTEM_PROMPT,
      prompt: `Title: ${payload.title ?? ""}\nUnit: ${payload.unit ?? ""}`,
    });
    return { result: text.trim() };
  }

  if (action === "generate-desc") {
    const { text } = await generateText({
      model: "google/gemini-2.5-flash-lite",
      system: GENERATE_DESCRIPTION_SYSTEM_PROMPT,
      prompt: `Title: ${payload.title ?? ""}\nUnit: ${payload.unit ?? ""}\nExisting description: ${payload.description ?? ""}`,
    });
    return { result: text.trim() };
  }

  throw new Error("Unsupported AI admin action");
};
