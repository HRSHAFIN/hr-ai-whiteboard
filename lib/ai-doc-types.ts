export const AI_DOC_TOOLS = [
  { value: "paraphrase", label: "Paraphraser", description: "Reword your text, same meaning" },
  { value: "humanize", label: "AI Humanizer", description: "Make it read more natural and human" },
] as const;

export type AiDocToolType = (typeof AI_DOC_TOOLS)[number]["value"];

export interface AiRewriteResponse {
  text: string;
}
