/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wand2, 
  Layout, 
  Palette, 
  Code, 
  CheckCircle2, 
  Loader2, 
  ExternalLink, 
  ChevronRight,
  RefreshCw,
  Terminal,
  Cpu
} from 'lucide-react';
import { generateWebsite, GenerateResult } from './services/orchestrator';
import { Provider } from './agents';
import LandingPage from './components/LandingPage';

type StepStatus = 'idle' | 'running' | 'completed' | 'error';

interface GenerationStep {
  id: string;
  label: string;
  icon: any;
  status: StepStatus;
}

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [provider, setProvider] = useState<Provider>("nvidia");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [steps, setSteps] = useState<GenerationStep[]>([
    { id: 'planning', label: 'Planning Structure', icon: Layout, status: 'idle' },
    { id: 'designing', label: 'Creating Design System', icon: Palette, status: 'idle' },
    { id: 'developing', label: 'Writing Code', icon: Code, status: 'idle' },
    { id: 'assembling', label: 'Assembling Website', icon: Wand2, status: 'idle' },
  ]);
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const updateStepStatus = (id: string, status: StepStatus) => {
    setSteps(prev => prev.map(step => step.id === id ? { ...step, status } : step));
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setResult(null);
    setLogs([]);
    setSteps(prev => prev.map(step => ({ ...step, status: 'idle' })));
    
    addLog(`Initializing multi-agent system with ${provider.toUpperCase()}...`);
    
    try {
      // Planning
      updateStepStatus('planning', 'running');
      addLog(`Agent 'Planner' is analyzing requirements using ${provider}...`);
      
      const genResult = await generateWebsite(prompt, provider);
      
      if (genResult.status === 'success') {
        setSteps(prev => prev.map(step => ({ ...step, status: 'completed' })));
        setResult(genResult);
        addLog("Website generation complete!");
      } else {
        setSteps(prev => prev.map(step => step.status === 'running' ? { ...step, status: 'error' } : step));
        addLog(`Error: ${genResult.error}`);
      }
    } catch (error) {
      addLog(`Fatal Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!hasStarted) {
    return <LandingPage onGetStarted={() => setHasStarted(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-b border-[#141414] p-4 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#141414] flex items-center justify-center rounded-sm">
            <Wand2 className="text-white w-5 h-5" />
          </div>
          <h1 className="font-serif italic text-xl tracking-tight">AI Website Generator</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-white border border-[#141414] p-1 rounded-sm shadow-[2px_2px_0px_0px_rgba(20,20,20,1)]">
            <button 
              onClick={() => setProvider('nvidia')}
              className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors ${provider === 'nvidia' ? 'bg-[#141414] text-white' : 'hover:bg-[#141414]/5'}`}
            >
              SHANKAR'S CHOICE
            </button>
            <button 
              onClick={() => setProvider('gemini')}
              className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors ${provider === 'gemini' ? 'bg-[#141414] text-white' : 'hover:bg-[#141414]/5'}`}
            >
              GEMINI
            </button>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono opacity-60">
            <span>v1.1.0</span>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span>{provider === 'nvidia' ? "SHANKAR'S CHOICE" : "GEMINI"} ACTIVE</span>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-[400px_1fr] h-[calc(100vh-65px)] overflow-hidden">
        {/* Sidebar */}
        <aside className="border-r border-[#141414] flex flex-col bg-white/30">
          <div className="p-6 flex-1 overflow-y-auto space-y-8">
            {/* Input Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[10px] uppercase tracking-widest opacity-50">Input Prompt</label>
                <Terminal className="w-3 h-3 opacity-30" />
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the website you want to build..."
                className="w-full h-32 bg-white border border-[#141414] p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#141414] resize-none placeholder:italic"
                disabled={isGenerating}
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-[#141414] text-[#E4E3E0] py-3 px-4 flex items-center justify-center gap-2 hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                )}
                <span className="font-mono text-xs uppercase tracking-widest">
                  {isGenerating ? "Generating..." : "Generate Website"}
                </span>
              </button>
            </section>

            {/* Status Steps */}
            <section className="space-y-4">
              <label className="font-mono text-[10px] uppercase tracking-widest opacity-50">Agent Pipeline</label>
              <div className="space-y-2">
                {steps.map((step) => (
                  <div 
                    key={step.id}
                    className={`flex items-center gap-3 p-3 border border-[#141414]/10 rounded-sm transition-all ${
                      step.status === 'running' ? 'bg-white border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]' : 
                      step.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-transparent'
                    }`}
                  >
                    <div className={`p-1.5 rounded-sm ${
                      step.status === 'running' ? 'bg-[#141414] text-white' : 
                      step.status === 'completed' ? 'bg-green-500 text-white' : 'bg-[#141414]/10 text-[#141414]/40'
                    }`}>
                      <step.icon className="w-3.5 h-3.5" />
                    </div>
                    <span className={`text-xs font-medium flex-1 ${step.status === 'idle' ? 'opacity-40' : 'opacity-100'}`}>
                      {step.label}
                    </span>
                    {step.status === 'running' && <Loader2 className="w-3 h-3 animate-spin" />}
                    {step.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                  </div>
                ))}
              </div>
            </section>

            {/* Logs */}
            <section className="space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-widest opacity-50">System Logs</label>
              <div className="bg-[#141414] text-[#E4E3E0] p-3 rounded-sm h-40 overflow-y-auto font-mono text-[10px] space-y-1 scrollbar-thin scrollbar-thumb-white/20">
                {logs.length === 0 && <span className="opacity-30 italic">Waiting for input...</span>}
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="opacity-40 shrink-0">{i + 1}</span>
                    <span className="break-all">{log}</span>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </section>
          </div>
        </aside>

        {/* Preview Area */}
        <section className="relative bg-white flex flex-col">
          <div className="border-b border-[#141414] p-3 flex justify-between items-center bg-[#F8F7F4]">
            <div className="flex items-center gap-4">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]"></div>
              </div>
              <div className="bg-white border border-[#141414]/20 px-3 py-1 rounded-full text-[10px] font-mono text-[#141414]/60 flex items-center gap-2">
                <span>{result?.plan?.title || "preview.local"}</span>
                <ChevronRight className="w-2 h-2" />
              </div>
            </div>
            {result && (
              <button 
                onClick={() => {
                  const blob = new Blob([result.html || ""], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  window.open(url, '_blank');
                }}
                className="text-[10px] font-mono uppercase tracking-widest flex items-center gap-1.5 hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                Open Fullscreen
              </button>
            )}
          </div>

          <div className="flex-1 bg-[#F0EFEC] p-8 overflow-auto flex justify-center items-start">
            <div className="w-full max-w-5xl aspect-video bg-white shadow-[12px_12px_0px_0px_rgba(20,20,20,0.05)] border border-[#141414] overflow-hidden relative">
              {result ? (
                <iframe
                  srcDoc={result.html}
                  className="w-full h-full border-none"
                  title="Website Preview"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 space-y-6">
                  <div className="w-16 h-16 border border-[#141414] flex items-center justify-center rotate-45">
                    <Layout className="w-8 h-8 -rotate-45 opacity-20" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="font-serif italic text-2xl">No Preview Available</h2>
                    <p className="text-sm opacity-50 max-w-xs mx-auto">
                      Enter a prompt and click generate to start the multi-agent building process.
                    </p>
                  </div>
                </div>
              )}
              
              {isGenerating && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex flex-col items-center justify-center z-20">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 border-t-2 border-r-2 border-[#141414] rounded-full flex items-center justify-center"
                  >
                    <Wand2 className="w-8 h-8 animate-pulse" />
                  </motion.div>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 font-mono text-xs uppercase tracking-[0.2em]"
                  >
                    Synthesizing Reality...
                  </motion.p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

