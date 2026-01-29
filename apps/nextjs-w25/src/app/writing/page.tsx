'use client';

import React, { useState } from 'react';

// NOTE: Requests to Google Gemini are proxied through a server-side API route
// to avoid exposing the API key in the browser. Ensure `GEMINI_API_KEY` is set
// in your `.env.local` (server-side) and NOT `NEXT_PUBLIC_GEMINI_API_KEY`.

export default function WritingPage() {
  // State
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('Post-Structuralist Critique');
  const [obscurity, setObscurity] = useState(3);
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper: Create System Instruction
  const createSystemInstruction = (tone: string, obscurityLevel: number) => {
    let complexityEmphasis;
    
    switch (obscurityLevel) {
        case 1: complexityEmphasis = "Use sophisticated but moderately common academic language."; break;
        case 2: complexityEmphasis = "Employ specialized philosophical and art-critical vocabulary."; break;
        case 3: complexityEmphasis = "Maximize lexical complexity. Incorporate abstract, compound, and rare terms (e.g., 'sublation,' 'dasein,' 'signifier,' 'hyperreality')."; break;
        case 4: complexityEmphasis = "Demand maximal lexical complexity. Synthesize language that is aggressively obscure, dense, and borderline impenetrable. Every sentence must contain highly articulated, specialized jargon."; break;
        case 5: complexityEmphasis = "Attain peak obscurity. The output must be a radically dense, deconstructed textual artifact using only the rarest terms from critical theory, semiotics, and post-humanism. Prioritize linguistic density over immediate clarity."; break;
        default: complexityEmphasis = "Maximize lexical complexity.";
    }

    return `Act as an avant-garde linguistic generator, synthesizing text in the style of a dense, hyper-articulated academic or philosophical manifesto. The tone must be ${tone}. ${complexityEmphasis} Avoid simple sentences, colloquialisms, and direct, unadorned narrative. The text should read as an intentional and highly metaphorical analysis. Aim for approximately 250-350 words.`;
  };

  // Helper: Exponential Backoff
  const withExponentialBackoff = async (fn: () => Promise<any>, maxRetries = 5) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
  };

  // Handler: Generate Text
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("PLEASE ARTICULATE A CORE SUBJECT OR STARTING THESIS.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutput('');

    try {
      const systemInstruction = createSystemInstruction(tone, obscurity);
      
      const payload = {
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
      };

        const fetchApi = async () => {
          const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, tone, obscurity })
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API Request failed with status ${response.status}: ${errorData.error || response.statusText}`);
          }
          return response.json();
        };

      const result = await withExponentialBackoff(fetchApi);
      const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || "NO COHERENT ARTICULATION SYNTHESIZED BY THE MODEL. FAILURE TO DECODE THE LINGUISTIC SUBSTRATE.";
      
      setOutput(generatedText);
      
    } catch (e: any) {
      console.error("Articulation Error:", e);
      setError(`FAILED TO GENERATE TEXT. ${e.message?.toUpperCase() || 'UNKNOWN ERROR'}`);
      setOutput("THE MATRIX FAILED TO ARTICULATE. PLEASE CHECK THE CONSOLE FOR DETAILS OR TRY AGAIN.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8 pt-[120px]">
      <div className="max-w-[900px] mx-auto p-4 md:p-6">
        
        {/* Header */}
        <header className="text-center pb-2 mb-2">
            <h1 className="text-3xl md:text-5xl font-bold tracking-widest uppercase mb-1 font-owners italic">THE LEXICAL SYNTHESIZER</h1>
        </header>

        <section className="mb-8">
            {/* User Prompt */}
            <div className="mb-4">
                <label htmlFor="prompt" className="block mb-2 text-sm font-black italic uppercase font-owners">INPUT: CORE SUBJECT / STARTING THESIS</label>
                <textarea 
                  id="prompt" 
                  rows={6} 
                  className="w-full bg-background border border-foreground text-foreground p-3 focus:outline-none rounded-none resize-none placeholder:text-foreground/30" 
                  placeholder="e.g., The inherent contradiction of the digital canvas..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                {/* Tone Selector */}
                <div className="mb-4 md:mb-0">
                    <label htmlFor="tone" className="block mb-2 text-sm font-black italic uppercase font-owners">SYNTACTIC TONE:</label>
                    <div className="relative">
                      <select 
                        id="tone" 
                        className="w-full bg-background border border-foreground text-foreground p-3 focus:outline-none rounded-none appearance-none cursor-pointer"
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                      >
                          <option value="Post-Structuralist Critique">POST-STRUCTURALIST CRITIQUE</option>
                          <option value="Existential Phenomenology">EXISTENTIAL PHENOMENOLOGY</option>
                          <option value="Surrealist Manifesto">SURREALIST MANIFESTO</option>
                          <option value="Deconstructed Materialism">DECONSTRUCTED MATERIALISM</option>
                          <option value="Avant-Garde Linguistic Synthesis">AVANT-GARDE LINGUISTIC SYNTHESIS</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-foreground">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                </div>
                
                {/* Obscurity/Complexity Slider */}
                <div>
                    <label htmlFor="obscurity" className="block mb-2 text-sm font-black italic uppercase font-owners">LEXICAL OBSCURITY LEVEL ({obscurity}/5):</label>
                    <div className="relative h-8 w-full flex items-center">
                        {/* Track - Using border to ensure visibility */}
                        <div className="w-full border-t border-foreground"></div>
                        
                        {/* Thumb (Visual only, follows state) */}
                        <div 
                            className="absolute h-4 w-4 bg-[#ff6600] border border-foreground rounded-full top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-100"
                            style={{ left: `calc(${((obscurity - 1) / 4) * 100}% - 8px)` }}
                        ></div>

                        {/* Input (Invisible, handles interaction) */}
                        <input 
                            type="range" 
                            id="obscurity" 
                            min="1" 
                            max="5" 
                            value={obscurity} 
                            onChange={(e) => setObscurity(parseInt(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                    </div>
                    <div className="flex justify-between text-xs opacity-50 mt-1 uppercase font-owners">
                        <span>1: LOW (ACCESSIBLE)</span>
                        <span>5: HIGH (MAXIMAL JARGON)</span>
                    </div>
                </div>
            </div>

            {/* Generate Button */}
            <button 
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full py-3 mt-2 text-base uppercase font-bold border border-foreground bg-[#ff6600] text-black hover:bg-background hover:text-[#ff6600] hover:border-[#ff6600] transition-colors duration-0 disabled:opacity-50 disabled:cursor-not-allowed font-owners"
            >
                {isLoading ? 'TRANSMITTING // SYNTHESIZING...' : 'Generate Hardcore Articulation'}
            </button>
        </section>

        {/* Output Display */}
        <section className="mb-8">
            <h2 className="text-lg font-bold mb-4 uppercase font-owners">SYNTHESIZED TEXTUAL ARTIFACT:</h2>
            <div className="bg-foreground/5 border border-foreground min-h-[400px] whitespace-pre-wrap p-4 md:p-6 text-sm text-foreground overflow-x-auto">
                {!output && !isLoading && !error && (
                  <p className="italic opacity-50">THE VOID OF THE DIGITAL PAGE AWAITS ITS EMERGENT SIGNIFIERS...</p>
                )}
                {output}
            </div>
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="text-center mt-4 uppercase font-owners">
                  <div className="flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 bg-foreground animate-pulse"></div>
                      <div className="w-3 h-3 bg-foreground animate-pulse delay-75"></div>
                      <div className="w-3 h-3 bg-foreground animate-pulse delay-150"></div>
                      <span className="text-sm">SYNTHESIZING POST-HUMAN LEXICON...</span>
                  </div>
              </div>
            )}
            
            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-900/20 border border-red-500 text-red-500">
                  <p><strong>ERROR IN ARTICULATION:</strong> {error}</p>
              </div>
            )}
        </section>

        {/* Impressum / Footer */}
        <footer className="mt-12 pt-6 border-t border-foreground/20 text-center opacity-60 uppercase font-owners text-[10px] md:text-xs tracking-widest space-y-1">
            <p className="font-bold mb-2">IMPRESSUM</p>
            <p>INSPIRED BY WWW.WORTE.AT (MIRIAM LAUSSEGGER & EVA BEIERHEIMER)</p>
            <p>POWERED BY GOOGLE GEMINI 3 FLASH (PREVIEW)</p>
            <p>APP STATE: V3.0 // REASONING ENGINE ACTIVE</p>
            <p>LAST CODE UPDATE: THU JAN 29 2026</p>
        </footer>
        
      </div>
    </div>
  );
}
