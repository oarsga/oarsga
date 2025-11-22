import React from 'react';
import { Job } from '../types';
import { Image, MoreHorizontal, Loader2, AlertCircle } from 'lucide-react';

interface GalleryProps {
  jobs: Job[];
  onSelect: (job: Job) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ jobs, onSelect }) => {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl">
        <Image size={48} className="mb-4 opacity-50" />
        <p className="text-sm font-medium">No outputs yet. Start creating.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pb-20">
      {jobs.map((job) => (
        <div 
          key={job.id}
          className="group relative aspect-square rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
          onClick={() => job.status === 'completed' && onSelect(job)}
        >
          {job.status === 'completed' && job.resultUrl ? (
            <>
              <img 
                src={job.resultUrl} 
                alt={job.params.prompt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                 <p className="text-white text-xs font-medium truncate">{job.params.prompt}</p>
                 <p className="text-white/70 text-[10px] font-mono mt-0.5">Seed: {job.actualSeed}</p>
              </div>
            </>
          ) : job.status === 'failed' ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 text-red-400 p-4 text-center">
                <AlertCircle size={24} className="mb-2" />
                <span className="text-xs font-medium">Generation Failed</span>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                <Loader2 size={24} className="animate-spin mb-2" />
                <span className="text-xs font-medium capitalize">{job.status}...</span>
            </div>
          )}
          
          {/* Status indicator dot for non-completed jobs */}
          {job.status !== 'completed' && job.status !== 'failed' && (
            <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50" />
          )}
        </div>
      ))}
    </div>
  );
};
