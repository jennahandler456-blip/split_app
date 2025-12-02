import React from 'react';

interface TextInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  hint?: string;
  className?: string;
}

const TextInput: React.FC<TextInputProps> = ({ label, value, onChange, placeholder, icon, hint, className = "" }) => {
  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200">
          {icon}
          {label}
        </div>
        {hint && <span className="text-xs text-gray-500 dark:text-gray-400">{hint}</span>}
      </div>
      <textarea
        className="flex-1 w-full p-4 text-sm font-mono text-gray-800 bg-white border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-slate-800 dark:border-gray-700 dark:text-gray-300 transition-all shadow-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
      />
    </div>
  );
};

export default TextInput;