
import React from 'react';
import { AgentAction } from '../types';

interface AgentDisplayProps {
  actions: AgentAction[];
}

const AgentDisplay: React.FC<AgentDisplayProps> = ({ actions }) => {
  return (
    <div className="flex flex-col gap-3 my-4">
      {actions.map((action, idx) => (
        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-purple-600 text-lg">🟣</span>
              <span className="font-semibold text-slate-800 text-sm">{action.agentName}</span>
            </div>
            {action.decision && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-md text-xs font-medium border border-green-200">
                🟢 {action.decision}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed italic">
            <span className="font-medium text-slate-400 not-italic mr-1">🔍 Reasoning:</span>
            {action.reasoning}
          </p>
        </div>
      ))}
    </div>
  );
};

export default AgentDisplay;
