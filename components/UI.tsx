import React from 'react';
import { Loader2 } from 'lucide-react';

export interface GlassPanelProps {
  children?: React.ReactNode;
  className?: string;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({ children, className = "" }) => (
  <div className={`bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm rounded-2xl ${className}`}>
    {children}
  </div>
);

export interface ButtonProps { 
  onClick?: () => void; 
  children?: React.ReactNode; 
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  disabled = false,
  className = "",
  size = 'md'
}) => {
  const baseStyle = "relative inline-flex items-center justify-center transition-all duration-200 font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
  
  const variants = {
    primary: "bg-black text-white hover:bg-gray-800 shadow-md hover:shadow-lg",
    secondary: "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100/50 hover:text-gray-900",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2.5",
    lg: "text-base px-6 py-3",
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

export interface LabelProps { children?: React.ReactNode }

export const Label: React.FC<LabelProps> = ({ children }) => (
  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 ml-1">
    {children}
  </label>
);

export const Input = ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    {...props} 
    className="w-full bg-white/50 border border-gray-200/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-mono placeholder:font-sans"
  />
);

export const Spinner = ({ className = "" }: { className?: string }) => (
    <Loader2 className={`animate-spin ${className}`} />
);