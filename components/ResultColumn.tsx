import React, { useState } from 'react';
import { ColumnData } from '../types';
import { CopyIcon, CheckIcon } from './Icon';

interface ResultColumnProps {
  column: ColumnData;
}

const ResultColumn: React.FC<ResultColumnProps> = ({ column }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (column.ips.length === 0) return;
    
    const text = column.ips.join('\n');
      
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-w-[200px] flex-1 h-full bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-indigo-400/30 dark:hover:border-indigo-500/30">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-slate-850 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-baseline gap-2">
            <span className="font-bold text-gray-700 dark:text-gray-200">Col {column.id}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">({column.totalIps})</span>
        </div>
        <button
          onClick={handleCopy}
          disabled={column.ips.length === 0}
          className={`p-1.5 rounded-md transition-colors ${
            copied 
              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
              : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 disabled:opacity-50'
          }`}
          title="Copy column"
        >
          {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
        </button>
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto p-0 font-mono text-sm text-gray-600 dark:text-gray-300 scroll-smooth">
        {column.ips.length === 0 ? (
           <div className="h-full flex items-center justify-center opacity-30 italic text-xs p-4">
               Empty
           </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800/50">
            {column.ips.map((ip, idx) => (
                <li key={`${ip}-${idx}`} className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  {ip}
                </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ResultColumn;