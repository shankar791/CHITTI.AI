import { 
  runPlanner, 
  runDesigner, 
  runDeveloper, 
  runReviewer, 
  runAssembler, 
  WebsitePlan,
  Provider
} from "../agents";

export interface GenerateResult {
  status: 'success' | 'error';
  html?: string;
  sections?: Record<string, string>;
  plan?: WebsitePlan;
  error?: string;
}

export async function generateWebsite(prompt: string, provider: Provider = 'gemini'): Promise<GenerateResult> {
  try {
    console.log(`Starting website generation with ${provider} for prompt:`, prompt);
    
    // 1. Planning
    const plan = await runPlanner(prompt, provider);
    console.log("Plan generated:", plan);
    
    // 2. Designing
    const designSystem = await runDesigner(plan, provider);
    console.log("Design system generated:", designSystem);
    
    // 3. Developing and Reviewing sections in parallel
    const sectionNames = plan.sections;
    const results = await Promise.all(
      sectionNames.map(async (secName, index) => {
        // Add a small delay to avoid rate limits if needed
        await new Promise(resolve => setTimeout(resolve, index * 500));
        
        console.log(`Developing section: ${secName}`);
        const html = await runDeveloper(secName, plan, designSystem, provider);
        
        console.log(`Reviewing section: ${secName}`);
        const reviewedHtml = await runReviewer(html, provider);
        
        return { secName, reviewedHtml };
      })
    );
    
    const sectionsDict: Record<string, string> = {};
    results.forEach(({ secName, reviewedHtml }) => {
      sectionsDict[secName] = reviewedHtml;
    });
    
    // 4. Assembling
    const finalHtml = runAssembler(sectionsDict, plan);
    console.log("Website assembled successfully.");
    
    return {
      status: 'success',
      html: finalHtml,
      sections: sectionsDict,
      plan: plan
    };
  } catch (e) {
    console.error("Orchestrator failed:", e);
    return {
      status: 'error',
      error: e instanceof Error ? e.message : String(e)
    };
  }
}
