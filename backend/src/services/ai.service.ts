import {
  AIAdminAction,
  generateAIAdminContent,
} from "../lib/ai";
import { GenerateAIAdminInput } from "../validators/ai.validator";

export const generateAIAdminService = async (data: GenerateAIAdminInput) => {
  const result = await generateAIAdminContent(data.action as AIAdminAction, {
    title: data.title,
    unit: data.unit,
    description: data.description,
  });

  return result;
};
