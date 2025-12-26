
import React, { useState } from 'react';
import { X, Copy, Check, Terminal, ExternalLink, Settings } from 'lucide-react';
import { GOOGLE_SCRIPT_CODE } from '../constants';

interface InstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptUrl: string;
  setScriptUrl: (url: string) => void;
}

export const InstructionModal: React.FC<InstructionModalProps> = ({ 
  isOpen, 
  onClose, 
  scriptUrl, 
  setScriptUrl 
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyCode = () => {
    navigator.clipboard.writeText(GOOGLE_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Connection Setup</h2>
              <p className="text-sm text-gray-500">Connect React to Google Sheets via App Script</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Step 1: Input URL */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">1</span>
              <h3 className="font-semibold text-gray-900">Enter Web App URL</h3>
            </div>
            <div className="ml-8">
              <p className="text-sm text-gray-600 mb-2">Paste your deployed Google Script Web App URL here.</p>
              <input 
                type="text" 
                value={scriptUrl}
                onChange={(e) => setScriptUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm bg-white text-gray-900"
              />
            </div>
          </section>

          {/* Step 2: Create Sheet */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
               <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs font-bold">2</span>
              <h3 className="font-semibold text-gray-900">Setup Google Sheet</h3>
            </div>
            <div className="ml-8 text-sm text-gray-600 space-y-2">
              <p>1. Create a new Google Sheet.</p>
              <p>2. Go to <strong>Extensions &gt; Apps Script</strong>.</p>
              <p>3. Delete any code in <code>Code.gs</code> and paste the code below.</p>
            </div>
          </section>

          {/* Step 3: The Code */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs font-bold">3</span>
                <h3 className="font-semibold text-gray-900">Apps Script Code</h3>
              </div>
              <button 
                onClick={copyCode}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            
            <div className="ml-8 relative group">
              <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Terminal className="w-5 h-5 text-gray-400" />
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs font-mono overflow-x-auto h-64 shadow-inner border border-gray-700">
                {GOOGLE_SCRIPT_CODE}
              </pre>
            </div>
          </section>

          {/* Step 4: Deploy */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
               <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs font-bold">4</span>
              <h3 className="font-semibold text-gray-900">Deploy Instructions (Critical)</h3>
            </div>
            <div className="ml-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <ul className="text-sm text-amber-900 space-y-2 list-disc list-inside">
                <li>Click <strong>Deploy &gt; New deployment</strong>.</li>
                <li>Select type: <strong>Web App</strong>.</li>
                <li>Description: <span className="text-amber-700">API v1</span></li>
                <li>Execute as: <span className="font-bold">Me (your email)</span>.</li>
                <li>Who has access: <span className="font-bold text-red-600">Anyone</span>.</li>
                <li>Click <strong>Deploy</strong> and copy the URL into the field above.</li>
              </ul>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
