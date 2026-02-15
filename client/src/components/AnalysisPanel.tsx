import React from 'react';
import { AiAnalysisResult } from '@aura-match/shared';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AnalysisPanelProps {
  analysis: AiAnalysisResult | null;
  isLoading: boolean;
  onClose: () => void;
  onApplySuggestion?: (category: string, value: string) => void;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ analysis, isLoading, onClose, onApplySuggestion }) => {
  if (isLoading) {
    return (
      <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-50 p-6 border-l border-slate-100 flex flex-col items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-rose-200 rounded-full mb-4 animate-bounce"></div>
          <h3 className="text-lg font-semibold text-slate-700">Analyzing Vibe...</h3>
          <p className="text-slate-500 text-sm text-center mt-2">Checking compatibility with your ideal match type.</p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[28rem] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out border-l border-slate-200">
      {/* Header */}
      <div className="p-6 bg-gradient-to-br from-rose-50 to-orange-50 border-b border-rose-100 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-rose-500" />
            Coach's Report
          </h2>
          <p className="text-slate-600 text-sm mt-1">Based on your "Looking For" criteria</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/50 rounded-full transition-colors text-slate-500"
        >
          ✕
        </button>
      </div>

      {/* Content Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">

        {/* Score Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-900 text-white mb-3 shadow-lg ring-4 ring-rose-100">
            <span className="text-3xl font-bold">{analysis.matchScore}</span>
            <span className="text-xs absolute mt-12 opacity-80">%</span>
          </div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Match Potential</p>
          <div className="mt-4 px-4 py-2 bg-slate-100 rounded-lg inline-block text-slate-700 font-medium text-sm">
            Current Vibe: "{analysis.overallVibe}"
          </div>
        </div>

        {/* Suggestions */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Optimization Tips
          </h3>

          {analysis.suggestions.map((item, index) => (
            <div key={index} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                  {item.category}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                  Impact:
                  <span className={`px-1.5 py-0.5 rounded text-white ${item.impactScore >= 8 ? 'bg-emerald-500' : item.impactScore >= 5 ? 'bg-amber-400' : 'bg-slate-400'
                    }`}>
                    {item.impactScore}
                  </span>
                </span>
              </div>
              <p className="text-slate-700 text-sm mb-3 leading-relaxed">
                {item.advice}
              </p>

              {item.exampleRewrite && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Try saying:
                  </div>
                  <p className="text-slate-600 text-sm italic mb-2">"{item.exampleRewrite}"</p>
                  {onApplySuggestion && (
                    <button
                      onClick={() => onApplySuggestion(item.category, item.exampleRewrite!)}
                      className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-slate-700 transition-colors w-full sm:w-auto"
                    >
                      Apply Suggestion
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
        <button
          onClick={onClose}
          className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
        >
          Got it, I'll make changes
        </button>
      </div>
    </div>
  );
};

export default AnalysisPanel;