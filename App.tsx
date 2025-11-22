import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
    LayoutGrid, 
    Zap, 
    Image as ImageIcon, 
    UploadCloud, 
    Trash2, 
    Settings2, 
    History,
    Sparkles,
    Command
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import { generateImage } from './services/geminiService';
import { Job, GenerationParams, ReferenceImage, AspectRatio, JobStatus } from './types';
import { fileToBase64 } from './utils/helpers';

// Components
import { Button, Input, Label, GlassPanel, Spinner } from './components/UI';
import { Gallery } from './components/Gallery';
import { JobQueue } from './components/JobQueue';
import { ImageModal } from './components/ImageModal';

const INITIAL_PARAMS: GenerationParams = {
  prompt: '',
  negativePrompt: '',
  aspectRatio: '1:1',
  seed: null,
  referenceImages: []
};

export default function App() {
  const [params, setParams] = useState<GenerationParams>(INITIAL_PARAMS);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile/Responsive toggle
  
  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Queue Processing Effect
  useEffect(() => {
    const processQueue = async () => {
      const pendingJob = jobs.find(j => j.status === 'pending');
      if (!pendingJob) return;

      // Mark as generating
      setJobs(prev => prev.map(j => j.id === pendingJob.id ? { ...j, status: 'generating' } : j));

      try {
        // Get API Key from Environment
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("API Key not found");

        const result = await generateImage(pendingJob.params, apiKey);
        
        const resultUrl = `data:image/png;base64,${result.imageBase64}`;
        
        setJobs(prev => prev.map(j => 
          j.id === pendingJob.id 
            ? { ...j, status: 'completed', resultUrl, actualSeed: result.seed } 
            : j
        ));
      } catch (error: any) {
        console.error("Generation failed", error);
        setJobs(prev => prev.map(j => 
          j.id === pendingJob.id 
            ? { ...j, status: 'failed', error: error.message } 
            : j
        ));
      }
    };

    // Simple check to ensure we don't process if something is already generating
    const isGenerating = jobs.some(j => j.status === 'generating');
    if (!isGenerating) {
      processQueue();
    }
  }, [jobs]);

  // -- Handlers --

  const handleGenerate = () => {
    if (!params.prompt.trim()) return;
    
    const newJob: Job = {
      id: uuidv4(),
      timestamp: Date.now(),
      params: { ...params }, // Copy params
      status: 'pending'
    };

    setJobs(prev => [newJob, ...prev]);
  };

  const handleResubmit = () => {
     // Find last successful job params or use current
     handleGenerate();
  };

  const handleCancel = (id: string) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'cancelled' } : j));
  };

  const handleReuse = (job: Job) => {
    setParams(job.params);
    setSelectedJob(null);
  };

  // Reference Images
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as File[];
      const newRefs: ReferenceImage[] = [];
      
      for (const file of files) {
        if (params.referenceImages.length + newRefs.length >= 3) break;
        try {
          const base64 = await fileToBase64(file);
          newRefs.push({
            id: uuidv4(),
            file,
            previewUrl: URL.createObjectURL(file),
            base64,
            mimeType: file.type
          });
        } catch (err) {
          console.error("Error reading file", err);
        }
      }
      
      setParams(prev => ({
        ...prev,
        referenceImages: [...prev.referenceImages, ...newRefs].slice(0, 3)
      }));
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeReference = (id: string) => {
    setParams(prev => ({
      ...prev,
      referenceImages: prev.referenceImages.filter(r => r.id !== id)
    }));
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
           e.preventDefault();
           handleGenerate();
        }
        return;
      }

      if (e.key === 'Enter') handleGenerate();
      if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
         e.preventDefault();
         handleResubmit();
      }
      
      // Navigating outputs (Simple implementation: open first if none open)
      if (e.key === ' ' && jobs.length > 0 && !selectedJob) {
          e.preventDefault();
          const firstCompleted = jobs.find(j => j.status === 'completed');
          if (firstCompleted) setSelectedJob(firstCompleted);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [params, jobs, selectedJob]);


  return (
    <div className="min-h-screen flex font-sans text-slate-900 bg-[#F5F5F7]">
      
      {/* -- Sidebar (History & Settings) -- */}
      <div className="w-80 hidden lg:flex flex-col border-r border-gray-200 bg-white/50 backdrop-blur-xl fixed h-full z-20">
         <div className="p-6 border-b border-gray-200/50">
             <div className="flex items-center space-x-2 text-slate-900">
                 <div className="p-2 bg-black text-white rounded-lg shadow-lg shadow-blue-500/20">
                     <Sparkles size={20} fill="currentColor" />
                 </div>
                 <h1 className="font-bold text-lg tracking-tight">fofr's vibe</h1>
             </div>
         </div>
         
         <div className="flex-1 overflow-y-auto p-4 space-y-1">
             <Label>Recent Sessions</Label>
             {jobs.length === 0 && (
                 <div className="p-4 text-center text-gray-400 text-sm">No history yet.</div>
             )}
             {jobs.map(job => (
                 <div 
                   key={job.id} 
                   onClick={() => job.status === 'completed' && setSelectedJob(job)}
                   className={`p-3 rounded-xl cursor-pointer transition-all group ${job.status === 'completed' ? 'hover:bg-white hover:shadow-sm' : 'opacity-70'}`}
                 >
                     <div className="flex justify-between items-start mb-1">
                         <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md ${
                             job.status === 'completed' ? 'bg-green-100 text-green-700' :
                             job.status === 'failed' ? 'bg-red-100 text-red-700' :
                             'bg-blue-100 text-blue-700'
                         }`}>
                             {job.status}
                         </span>
                         <span className="text-[10px] text-gray-400">{new Date(job.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                     </div>
                     <p className="text-sm font-medium text-gray-800 truncate">{job.params.prompt}</p>
                 </div>
             ))}
         </div>

         <div className="p-4 border-t border-gray-200/50 text-[10px] text-gray-400 text-center">
             ⌘ + Enter to generate
         </div>
      </div>

      {/* -- Main Content -- */}
      <main className="flex-1 lg:ml-80 p-4 sm:p-6 md:p-10 max-w-7xl mx-auto w-full">
        
        {/* Header Mobile */}
        <div className="lg:hidden flex items-center justify-between mb-6">
             <div className="font-bold text-lg">fofr's vibe</div>
             <Button size="sm" variant="secondary" onClick={() => {}}>Menu</Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Left Column: Generator Form */}
            <div className="xl:col-span-1 space-y-6">
                <GlassPanel className="p-6 space-y-6 animate-fade-in">
                    {/* Prompt */}
                    <div>
                        <Label>Prompt</Label>
                        <textarea
                            value={params.prompt}
                            onChange={(e) => setParams(p => ({...p, prompt: e.target.value}))}
                            placeholder="Describe your imagination..."
                            className="w-full h-32 bg-white/50 border border-gray-200/60 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 resize-none transition-all font-mono placeholder:font-sans leading-relaxed"
                        />
                    </div>

                    {/* Negative Prompt */}
                    <div>
                         <div className="flex justify-between items-center">
                            <Label>Negative Prompt</Label>
                            <span className="text-[10px] text-gray-400 uppercase">Optional</span>
                         </div>
                        <Input
                            value={params.negativePrompt}
                            onChange={(e) => setParams(p => ({...p, negativePrompt: e.target.value}))}
                            placeholder="blur, low quality, distortion..."
                        />
                    </div>

                    {/* Parameters Grid */}
                    <div className="grid grid-cols-2 gap-4">
                         {/* Aspect Ratio */}
                         <div>
                             <Label>Aspect Ratio</Label>
                             <select 
                                value={params.aspectRatio}
                                onChange={(e) => setParams(p => ({...p, aspectRatio: e.target.value as AspectRatio}))}
                                className="w-full bg-white/50 border border-gray-200/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                             >
                                 <option value="1:1">1:1 (Square)</option>
                                 <option value="16:9">16:9 (Wide)</option>
                                 <option value="9:16">9:16 (Story)</option>
                                 <option value="4:3">4:3 (Classic)</option>
                                 <option value="3:4">3:4 (Portrait)</option>
                             </select>
                         </div>
                         
                         {/* Seed */}
                         <div>
                             <Label>Seed</Label>
                             <div className="flex space-x-2">
                                 <Input 
                                     type="number" 
                                     placeholder="Random"
                                     value={params.seed ?? ''}
                                     onChange={(e) => setParams(p => ({...p, seed: e.target.value ? parseInt(e.target.value) : null}))}
                                     className="min-w-0"
                                 />
                                 <button 
                                    onClick={() => setParams(p => ({...p, seed: null}))}
                                    className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500"
                                    title="Randomize"
                                 >
                                     <Zap size={16} />
                                 </button>
                             </div>
                         </div>
                    </div>

                    {/* Reference Images */}
                    <div>
                        <Label>Reference Images ({params.referenceImages.length}/3)</Label>
                        <div className="grid grid-cols-3 gap-3 mb-3">
                            {params.referenceImages.map(ref => (
                                <div key={ref.id} className="relative aspect-square rounded-lg overflow-hidden group">
                                    <img src={ref.previewUrl} className="w-full h-full object-cover" alt="ref" />
                                    <button 
                                        onClick={() => removeReference(ref.id)}
                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            
                            {params.referenceImages.length < 3 && (
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center justify-center text-gray-400 hover:text-blue-500"
                                >
                                    <UploadCloud size={20} className="mb-1" />
                                    <span className="text-[10px] font-medium">Add</span>
                                </button>
                            )}
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileSelect} 
                            className="hidden" 
                            accept="image/*"
                            multiple
                        />
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                        <Button 
                            onClick={handleGenerate} 
                            className="w-full h-12 text-base shadow-blue-500/20"
                            disabled={!params.prompt.trim()}
                        >
                            Run Experiment
                            <Command size={14} className="ml-2 opacity-70" />
                        </Button>
                    </div>
                </GlassPanel>
            </div>

            {/* Right Column: Queue & Results */}
            <div className="xl:col-span-2 flex flex-col h-full">
                <JobQueue jobs={jobs} onCancel={handleCancel} />
                
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold tracking-tight">Experiments</h2>
                    <div className="flex space-x-2">
                         <div className="text-xs text-gray-400 font-medium bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                             {jobs.filter(j => j.status === 'completed').length} Generated
                         </div>
                    </div>
                </div>
                
                <div className="flex-1">
                    <Gallery jobs={jobs} onSelect={setSelectedJob} />
                </div>
            </div>
        </div>

      </main>

      {/* Modals */}
      {selectedJob && (
        <ImageModal 
            job={selectedJob} 
            onClose={() => setSelectedJob(null)} 
            onReuse={handleReuse}
        />
      )}

    </div>
  );
}