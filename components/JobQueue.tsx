import React from 'react';
import { Job } from '../types';
import { XCircle, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { GlassPanel } from './UI';

interface JobQueueProps {
  jobs: Job[];
  onCancel: (jobId: string) => void;
}

export const JobQueue: React.FC<JobQueueProps> = ({ jobs, onCancel }) => {
  // Filter only active/processing/recent jobs
  const activeJobs = jobs.filter(j => ['pending', 'generating'].includes(j.status));

  if (activeJobs.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Queue</h3>
        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{activeJobs.length} processing</span>
      </div>
      
      <div className="space-y-3">
        {activeJobs.map(job => (
          <GlassPanel key={job.id} className="p-4 flex items-center justify-between group transition-all hover:shadow-md">
            <div className="flex items-center space-x-4 overflow-hidden">
               <div className="relative flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  {job.status === 'generating' ? (
                      <Loader2 size={20} className="text-blue-500 animate-spin" />
                  ) : (
                      <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  )}
               </div>
               <div className="min-w-0">
                 <p className="text-sm font-semibold text-gray-800 truncate pr-4">{job.params.prompt}</p>
                 <p className="text-xs text-gray-500 font-mono mt-0.5 flex items-center">
                    {job.status === 'generating' ? 'Generating...' : 'Queued'} 
                    <span className="mx-1.5 opacity-30">|</span> 
                    {job.params.aspectRatio}
                 </p>
               </div>
            </div>
            
            <button 
              onClick={() => onCancel(job.id)}
              className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
              title="Cancel"
            >
              <XCircle size={18} />
            </button>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
};
