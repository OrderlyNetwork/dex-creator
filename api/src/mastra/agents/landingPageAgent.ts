import { Agent } from "@mastra/core/agent";

export const landingPageAgent = new Agent({
  id: "landing-page-agent",
  name: "Landing Page Agent",
  instructions:
    "You are a helpful assistant for landing page creation and optimization. Help users create compelling landing pages with effective copy, design suggestions, and conversion optimization strategies.",
  model: "qwen-3-32b",
});
