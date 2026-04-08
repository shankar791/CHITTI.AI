/**
 * Utility functions for cleaning and validating LLM outputs.
 */

export function cleanLLMJson(text: string): any {
  try {
    // Remove markdown code blocks if present
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse JSON from LLM output:", text);
    return null;
  }
}

export function cleanLLMHtml(text: string): string {
  // Remove markdown code blocks if present
  return text.replace(/```html\n?|\n?```/g, '').trim();
}

export function validateJson(data: any, defaultValue: any): any {
  if (!data || typeof data !== 'object') {
    return defaultValue;
  }
  return data;
}

export function validateHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '<section><h2>Section Failed</h2></section>';
  }
  return html;
}
