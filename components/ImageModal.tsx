import React, { useEffect, useState } from 'react';
import { X, Download, Copy, Edit2, Check } from 'lucide-react';
import { Job } from '../types';
import { Button } from './UI';
import { downloadImage, generateFilename } from '../utils/helpers';

interface ImageModalProps {
  job: Job | null;
  onClose: () => void;
  onReuse: (job: Job) => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ job, onClose, onReuse }) => {
  const [copied, setCopied] = useState(false);

  // Reset copied state when job changes
  useEffect(() => {
    setCopied(false);
  }, [job]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!job || !job.resultUrl) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(job.params.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
      if (job.resultUrl) {
          downloadImage(job.resultUrl, generateFilename(job.params.prompt, job.actualSeed || 0));
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
      <div 
        className="absolute inset-0 bg-white/30 backdrop-blur-xl transition-opacity duration-300" 
        onClick={onClose}
      />
      
      <div className="relative z-10 flex flex-col md:flex-row max-w-6xl w-full max-h-[90vh] bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden animate-slide-up">
        
        {/* Image Area */}
        <div className="flex-1 bg-gray-50/50 flex items-center justify-center p-4 md:p-8 relative group overflow-hidden">
          <img 
            src={job.resultUrl} 
            alt={job.params.prompt} 
            className="max-w-full max-h-full object-contain rounded-lg shadow-md transition-transform duration-500 hover:scale-[1.02]"
          />
        </div>

        {/* Sidebar Info */}
        <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-gray-200/50 p-6 flex flex-col bg-white/40">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Output Details</h2>
                <button 
                    onClick={onClose} 
                    className="p-2 rounded-full hover:bg-gray-200/50 transition-colors"
                >
                    <X size={20} className="text-gray-500" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2">
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Prompt</label>
                    <p className="mt-2 text-sm text-gray-800 font-medium leading-relaxed font-mono">
                        {job.params.prompt}
                    </p>
                </div>

                {job.params.negativePrompt && (
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Negative Prompt</label>
                        <p className="mt-2 text-sm text-gray-600 font-mono leading-relaxed">
                            {job.params.negativePrompt}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Aspect Ratio</label>
                        <p className="mt-1 text-sm text-gray-800">{job.params.aspectRatio}</p>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Seed</label>
                        <p className="mt-1 text-sm text-gray-800 font-mono">{job.actualSeed}</p>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Model</label>
                        <p className="mt-1 text-sm text-gray-800">Nano Banana</p>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200/50 space-y-3">
                 <Button onClick={handleDownload} variant="primary" className="w-full" size="lg">
                    <Download size={18} className="mr-2" /> Download
                </Button>
                <div className="flex gap-3">
                    <Button onClick={handleCopy} variant="secondary" className="flex-1">
                        {copied ? <Check size={18} className="mr-2 text-green-600" /> : <Copy size={18} className="mr-2" />}
                        {copied ? "Copied" : "Copy Prompt"}
                    </Button>
                    <Button onClick={() => onReuse(job)} variant="secondary" className="flex-1">
                        <Edit2 size={18} className="mr-2" /> Reuse
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
