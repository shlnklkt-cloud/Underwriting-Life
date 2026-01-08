
import React from 'react';
import { UnderwritingState } from '../types';

interface PolicyPDFProps {
  state: UnderwritingState;
}

const PolicyPDF: React.FC<PolicyPDFProps> = ({ state }) => {
  return (
    <div className="max-w-2xl mx-auto bg-white shadow-2xl p-12 border border-slate-200 rounded-sm font-serif text-slate-800">
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-widest text-slate-900">AuraLife Assurance</h1>
          <p className="text-xs italic text-slate-500">Official Policy Document - Term Life</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold">Policy #: {state.policyNumber || 'AURA-99283-X'}</p>
          <p className="text-xs">Issue Date: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-lg font-bold border-b border-slate-200 mb-2 uppercase text-xs tracking-tighter">Insured Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-slate-500">Gender:</span> {state.gender}</div>
            <div><span className="text-slate-500">Age:</span> {state.age}</div>
            <div><span className="text-slate-500">Occupation:</span> {state.occupation}</div>
            <div><span className="text-slate-500">Smoking Status:</span> {state.smokingStatus}</div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold border-b border-slate-200 mb-2 uppercase text-xs tracking-tighter">Coverage Summary</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-slate-500">Sum Assured:</span> ${state.amount?.toLocaleString()}</div>
            <div><span className="text-slate-500">Policy Term:</span> {state.term} Years</div>
            <div><span className="text-slate-500">Annual Premium:</span> ${state.annualPremium?.toLocaleString()}</div>
            <div><span className="text-slate-500">Underwriting Class:</span> {state.riskRating}</div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold border-b border-slate-200 mb-2 uppercase text-xs tracking-tighter">Underwriting Disclosures</h2>
          <div className="bg-slate-50 p-4 rounded border border-slate-100 text-xs italic space-y-2">
            <p>• Diabetes History: {state.diabetes}</p>
            <p>• BMI Assessment: {state.bmi ? (state.bmi > 25 ? 'High' : 'Normal') : 'Not Provided'}</p>
            <p>• Risk Evaluation: Underwriting performed via AI-Agentic Orchestration. Risk multiplier of {state.riskMultiplier}x applied.</p>
          </div>
        </section>

        <section className="pt-12">
          <div className="flex justify-between items-end">
            <div className="w-1/2">
              <div className="h-px bg-slate-400 mb-2"></div>
              <p className="text-[10px] uppercase font-bold">Authorized Signatory - AuraLife</p>
            </div>
            <div className="text-[8px] text-slate-400 text-right uppercase">
              Regulatory Disclaimer: This is a digital simulation.<br/>Subject to verification of physical records.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PolicyPDF;
