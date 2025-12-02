import React, { useState, useMemo, useEffect } from 'react';
import { processIPs } from './utils/ipLogic';
import TextInput from './components/TextInput';
import ResultColumn from './components/ResultColumn';
import { SunIcon, MoonIcon, GridIcon, ShieldBanIcon, TrashIcon } from './components/Icon';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [rawInput, setRawInput] = useState<string>("");
  const [spamInput, setSpamInput] = useState<string>("");
  const [columnCount, setColumnCount] = useState<number>(4);

  // Initialize theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Process data efficiently
  const { columns, stats } = useMemo(() => {
    return processIPs(rawInput, spamInput, columnCount);
  }, [rawInput, spamInput, columnCount]);

  // Clear all inputs
  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all inputs?")) {
      setRawInput("");
      setSpamInput("");
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* --- Top Bar / Header --- */}
      <header className="flex-none h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 z-20 shadow-sm relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
             <GridIcon className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-800 dark:text-white uppercase">
            IP REPO SHUFFLE
          </h1>
        </div>

        <div className="flex items-center gap-6">
          {/* Stats Widget */}
          <div className="hidden xl:flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700">
             <div className="flex gap-1">
                <span>Input:</span>
                <span className="text-gray-900 dark:text-white">{stats.totalInput}</span>
             </div>
             <div className="w-px h-3 bg-gray-300 dark:bg-gray-600"></div>
             <div className="flex gap-1">
                <span>Valid:</span>
                <span className="text-indigo-600 dark:text-indigo-400">{stats.validUnique}</span>
             </div>
             <div className="w-px h-3 bg-gray-300 dark:bg-gray-600"></div>
             <div className="flex gap-1">
                <span>Groups:</span>
                <span className="text-purple-600 dark:text-purple-400">{stats.totalGroups}</span>
             </div>
             <div className="w-px h-3 bg-gray-300 dark:bg-gray-600"></div>
             <div className="flex gap-1">
                <span>Removed:</span>
                <span className="text-red-500">{stats.spamRemoved}</span>
             </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
             <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium border border-transparent hover:border-red-200 dark:hover:border-red-800"
              title="Clear all inputs"
            >
              <TrashIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>

             <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

             <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
              title="Toggle Theme"
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </header>

      {/* --- Main Workspace --- */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-gray-50 dark:bg-slate-900/50">
        
        {/* LEFT: IP Input */}
        <section className="flex-none w-full lg:w-80 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-4 lg:p-6 shadow-sm z-10 flex flex-col gap-4">
            
            {/* Column Selector */}
            <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Target Columns</span>
                    <span className="text-[10px] text-gray-400">Auto-balanced</span>
                </div>
                <select 
                    value={columnCount} 
                    onChange={(e) => setColumnCount(Number(e.target.value))}
                    className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm font-bold rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-20 p-2 outline-none cursor-pointer hover:border-indigo-400 transition-colors shadow-sm"
                >
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <option key={n} value={n}>{n}</option>
                    ))}
                </select>
            </div>

            <TextInput 
              label="IPs Input"
              value={rawInput}
              onChange={setRawInput}
              placeholder="Paste list of IPs here...&#10;192.168.1.10&#10;10.0.0.1&#10;..."
              icon={<GridIcon className="w-4 h-4 text-indigo-500" />}
              className="flex-1"
            />
        </section>

        {/* CENTER: Columns Display */}
        <section className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          
          {/* Scrollable Container for Columns */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 lg:p-6 scroll-smooth snap-x snap-mandatory">
            <div className="h-full flex gap-4 lg:gap-6 min-w-max mx-auto" style={{
                // Ensure it stretches to fill if content is small, but scrolls if large
                minWidth: '100%' 
            }}>
                {columns.map((col) => (
                    <div key={col.id} className="w-[260px] lg:w-[20rem] h-full snap-start">
                        <ResultColumn column={col} />
                    </div>
                ))}
            </div>
          </div>
          
          {/* Empty State Overlay */}
          {stats.validUnique === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 dark:bg-slate-900/50 backdrop-blur-sm pointer-events-none">
                <div className="text-center p-8 max-w-md">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-4">
                        <GridIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Ready to Shuffle</h3>
                    <p className="text-gray-500 dark:text-gray-400">Paste your IP addresses. We'll clean them, interleave classes, and shuffle them into balanced columns.</p>
                </div>
            </div>
          )}
        </section>

        {/* RIGHT: Spam Removal */}
        <section className="flex-none w-full lg:w-72 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-4 lg:p-6 shadow-sm z-10 flex flex-col">
            <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 flex-1 flex flex-col border border-red-100 dark:border-red-900/20">
                <TextInput 
                    label="Remove Spam"
                    value={spamInput}
                    onChange={setSpamInput}
                    placeholder="Enter IPs to exclude...&#10;Excluded IPs vanish instantly."
                    icon={<ShieldBanIcon className="w-4 h-4 text-red-500" />}
                    className="flex-1 bg-transparent"
                />
            </div>
            
            {/* Quick Summary Footer in Spam Column */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <span>Cleaned Total:</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white text-base">{stats.validUnique}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                    <div 
                        className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" 
                        style={{ width: stats.totalInput > 0 ? `${(stats.validUnique / stats.totalInput) * 100}%` : '0%' }}
                    ></div>
                </div>
            </div>

            {/* SIGNATURE */}
            <div className="mt-auto pt-6 text-[10px] uppercase tracking-widest text-center font-bold text-gray-300 dark:text-gray-600 select-none">
                Made by ILYAS HOUARI CMHW
            </div>
        </section>
      </main>
    </div>
  );
};

export default App;