import { ai } from "../services/gemini";
import { 
  PLANNER_PROMPT, 
  DESIGNER_PROMPT, 
  DEVELOPER_PROMPT, 
  REVIEWER_PROMPT 
} from "../prompts";
import { cleanLLMJson, cleanLLMHtml, validateJson, validateHtml } from "../utils";

export interface WebsitePlan {
  title: string;
  theme: 'light' | 'dark';
  sections: string[];
}

export interface DesignSystem {
  colors: {
    primary: string;
    background: string;
    text: string;
  };
  fonts: string;
  spacing: string;
}

export type Provider = 'gemini' | 'nvidia';

async function callModel(
  prompt: string, 
  provider: Provider, 
  config: { systemInstruction?: string; responseMimeType?: string } = {}
): Promise<string> {
  if (provider === 'gemini') {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: config.systemInstruction,
        responseMimeType: config.responseMimeType as any,
      },
    });
    return response.text || "";
  } else {
    const response = await fetch("/api/nvidia/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        prompt, 
        systemInstruction: config.systemInstruction, 
        responseMimeType: config.responseMimeType 
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "NVIDIA API call failed");
    }
    
    const data = await response.json();
    return data.text || "";
  }
}

export async function runPlanner(prompt: string, provider: Provider = 'gemini'): Promise<WebsitePlan> {
  const defaultPlan: WebsitePlan = { 
    title: "Modern Website", 
    theme: "light", 
    sections: ["navbar", "hero", "features", "footer"] 
  };
  
  try {
    const text = await callModel(prompt, provider, {
      systemInstruction: PLANNER_PROMPT,
      responseMimeType: "application/json",
    });
    
    return validateJson(cleanLLMJson(text), defaultPlan);
  } catch (e) {
    console.error("Planner failed:", e);
    return defaultPlan;
  }
}

export async function runDesigner(plan: WebsitePlan, provider: Provider = 'gemini'): Promise<DesignSystem> {
  const defaultDesign: DesignSystem = {
    colors: { 
      primary: "text-blue-600 bg-blue-50", 
      background: "bg-white", 
      text: "text-slate-900" 
    },
    fonts: "font-sans",
    spacing: "py-16 px-6"
  };
  
  try {
    const text = await callModel(JSON.stringify(plan), provider, {
      systemInstruction: DESIGNER_PROMPT,
      responseMimeType: "application/json",
    });
    
    return validateJson(cleanLLMJson(text), defaultDesign);
  } catch (e) {
    console.error("Designer failed:", e);
    return defaultDesign;
  }
}

export async function runDeveloper(
  sectionName: string, 
  plan: WebsitePlan, 
  designSystem: DesignSystem,
  provider: Provider = 'gemini'
): Promise<string> {
  try {
    const prompt = `Section: ${sectionName}\nPlan: ${JSON.stringify(plan)}\nDesign: ${JSON.stringify(designSystem)}`;
    const text = await callModel(prompt, provider, {
      systemInstruction: DEVELOPER_PROMPT,
    });
    
    return validateHtml(cleanLLMHtml(text));
  } catch (e) {
    console.error(`Developer failed for section ${sectionName}:`, e);
    return `<section><h2>${sectionName} Failed</h2></section>`;
  }
}

export async function runReviewer(html: string, provider: Provider = 'gemini'): Promise<string> {
  try {
    const text = await callModel(html, provider, {
      systemInstruction: REVIEWER_PROMPT,
    });
    
    return validateHtml(cleanLLMHtml(text));
  } catch (e) {
    console.error("Reviewer failed:", e);
    return html;
  }
}

export function runAssembler(sections: Record<string, string>, plan: WebsitePlan): string {
  const sectionHtml = plan.sections.map(sec => sections[sec] || "").join("\n");
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${plan.title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="${plan.theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}">
    ${sectionHtml}
</body>
</html>
  `.trim();
}
