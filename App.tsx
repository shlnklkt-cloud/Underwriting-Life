import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import AgentDisplay from './components/AgentDisplay';
import PolicyPDF from './components/PolicyPDF';
import { AppView, ChatMessage, UnderwritingState, AgentAction } from './types';
import { processUnderwritingStep } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hello! I'm Aura, your agentic underwriting assistant. Let's start your Individual Life Application. What is your current age?" }
  ]);
  const [history, setHistory] = useState<{ role: string; parts: { text: string }[] }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [underwritingState, setUnderwritingState] = useState<UnderwritingState>({});
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (textOverride?: string) => {
    const userText = (textOverride || input).trim();
    if (!userText || isTyping) return;

    if (userText === "Proceed to payment") {
      setView(AppView.PAYMENT);
      return;
    }

    if (!textOverride) setInput('');
    
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);

    try {
      const result = await processUnderwritingStep(history, userText);
      
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: result.nextQuestion,
        agentActions: result.agentActions,
        options: result.options,
        isQuote: !!result.showQuote
      }]);

      setHistory(prev => [
        ...prev,
        { role: 'user', parts: [{ text: userText }] },
        { role: 'model', parts: [{ text: JSON.stringify(result) }] }
      ]);

      if (result.state) {
        setUnderwritingState(prev => ({ ...prev, ...result.state }));
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: "The agents are momentarily busy due to high demand. Please try sending that last message again in a few seconds." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePayment = () => {
    setPaymentSuccess(true);
    setTimeout(() => {
      setView(AppView.POLICY);
    }, 2000);
  };

  if (view === AppView.LANDING) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto">
          <div className="mb-6 inline-block bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide uppercase">
            Agentic Risk Orchestration
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight text-slate-900 leading-tight">
            Insurance as <span className="text-purple-600 underline decoration-purple-200 decoration-8 underline-offset-8">fast as agents think.</span>
          </h1>
          <p className="text-xl text-slate-600 mb-12 max-w-2xl leading-relaxed">
            Get fully underwritten life coverage using our multi-agent AI framework. Transparent, fast, and medically accurate.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
            <button 
              onClick={() => setView(AppView.MEDICAL_SELECTION)}
              className="bg-purple-600 text-white px-8 py-5 rounded-2xl text-lg font-bold hover:bg-purple-700 transition-all shadow-xl hover:shadow-purple-200 group flex flex-col items-center gap-2"
            >
              <span>Individual Life</span>
              <span className="text-xs font-normal opacity-80">Full Medical Underwriting</span>
            </button>
            <button className="bg-white text-slate-900 border border-slate-200 px-8 py-5 rounded-2xl text-lg font-bold hover:bg-slate-50 transition-all group flex flex-col items-center gap-2">
              <span>Group Life</span>
              <span className="text-xs font-normal opacity-50 italic">Corporate Plans Only</span>
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (view === AppView.MEDICAL_SELECTION) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto">
          <button 
            onClick={() => setView(AppView.LANDING)}
            className="mb-8 text-sm text-slate-400 hover:text-slate-600 transition flex items-center gap-2"
          >
            ← Back to Selection
          </button>
          <h2 className="text-3xl font-bold mb-4">Select Individual Path</h2>
          <p className="text-slate-500 mb-10 leading-relaxed">To provide the most accurate pricing, please select your required assessment level.</p>
          <div className="space-y-4 w-full">
            <div 
              onClick={() => setView(AppView.CHAT)}
              className="p-6 bg-white border-2 border-slate-200 hover:border-purple-600 rounded-3xl cursor-pointer transition-all group text-left relative overflow-hidden"
            >
              <div className="absolute right-6 top-6 text-2xl group-hover:scale-125 transition">🩺</div>
              <h3 className="font-bold text-xl mb-1">Medical Assessment</h3>
              <p className="text-sm text-slate-500">Includes agentic interpretation of lab values, BMI, and disclosed history.</p>
            </div>
            <div className="p-6 bg-slate-100 border-2 border-slate-200 rounded-3xl opacity-60 cursor-not-allowed text-left">
              <h3 className="font-bold text-xl mb-1">Non-Medical Path</h3>
              <p className="text-sm text-slate-500">Quick-pass for healthy applicants under age 40. (Coming Soon)</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (view === AppView.PAYMENT) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
            <h2 className="text-2xl font-bold mb-6 text-slate-900 text-center">Finalize Your Policy</h2>
            <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-200">
              <div className="flex justify-between mb-4">
                <span className="text-slate-500 font-medium text-sm">Annual Premium</span>
                <span className="text-xl font-bold text-slate-900">${underwritingState.annualPremium?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium text-sm">Sum Assured</span>
                <span className="text-slate-900 font-bold">${underwritingState.amount?.toLocaleString()}</span>
              </div>
            </div>
            {!paymentSuccess ? (
              <button 
                onClick={handlePayment}
                className="w-full bg-purple-600 text-white py-4 rounded-2xl text-lg font-bold hover:bg-purple-700 transition shadow-lg"
              >
                Pay Now & Issue Policy
              </button>
            ) : (
              <div className="text-center py-4 text-green-600 font-bold flex flex-col items-center gap-2">
                <span className="text-4xl">✅</span>
                Payment Successful! Issuing Policy...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (view === AppView.POLICY) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans overflow-auto py-12 px-6">
        <Header />
        <div className="max-w-4xl mx-auto w-full mt-10">
          <div className="bg-green-600 text-white p-6 rounded-t-3xl flex justify-between items-center shadow-lg">
            <div>
              <h2 className="text-2xl font-bold">Policy Issued Successfully</h2>
              <p className="opacity-90">Your coverage is now active.</p>
            </div>
            <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium transition">Download PDF</button>
          </div>
          <div className="bg-white p-2 rounded-b-3xl shadow-2xl">
            <PolicyPDF state={underwritingState} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 h-screen overflow-hidden">
      <Header />
      <div className="flex-1 max-w-5xl mx-auto w-full flex flex-col md:flex-row h-full overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white border-x border-slate-200 h-full relative">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">A</div>
              <div>
                <h2 className="font-bold text-slate-800 leading-none">Aura Underwriter</h2>
                <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">● Medical Logic Active</span>
              </div>
            </div>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth pb-32">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.agentActions && <AgentDisplay actions={msg.agentActions} />}
                <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-purple-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
                {msg.options && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {msg.options.map((opt, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleSendMessage(opt)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-sm active:scale-95 ${
                          opt === 'Proceed to payment' 
                            ? 'bg-purple-600 text-white hover:bg-purple-700' 
                            : 'bg-white border border-purple-200 text-purple-700 hover:bg-purple-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex flex-col items-start animate-in fade-in duration-300">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 flex gap-2 items-center">
                   <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                   <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                   <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                   <span className="text-xs font-medium text-slate-400 ml-2">Orchestrating Agents...</span>
                </div>
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100">
            <div className="flex gap-2 max-w-4xl mx-auto">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Answer here..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all shadow-inner"
              />
              <button 
                onClick={() => handleSendMessage()}
                disabled={isTyping}
                className="bg-purple-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-purple-700 transition shadow-lg shadow-purple-200 disabled:opacity-50 active:scale-95"
              >
                ➔
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Status */}
        <div className="hidden lg:flex w-80 bg-slate-50 flex-col p-6 border-r border-slate-200">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Real-time Profile</h3>
          <div className="space-y-4">
            <ProfileItem label="Age" value={underwritingState.age} />
            <ProfileItem label="Gender" value={underwritingState.gender} />
            <ProfileItem label="Sum Assured" value={underwritingState.amount ? `$${underwritingState.amount.toLocaleString()}` : undefined} />
            <ProfileItem label="Annual Premium" value={underwritingState.annualPremium ? `$${underwritingState.annualPremium.toLocaleString()}` : undefined} highlight />
            <ProfileItem label="Risk Rating" value={underwritingState.riskRating} />
          </div>
          
          <div className="mt-auto pt-10">
            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
              <h4 className="text-xs font-bold text-purple-700 uppercase mb-2">Audit Log</h4>
              <p className="text-[10px] text-purple-600/70 leading-relaxed italic">
                AI Agent reasoning is finalized and ready for medical officer review if flagged.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileItem: React.FC<{ label: string; value?: string | number; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className={`p-3 rounded-xl border transition-all ${highlight ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-100' : 'bg-white border-slate-200 text-slate-800'}`}>
    <div className={`text-[10px] uppercase font-bold ${highlight ? 'text-purple-200' : 'text-slate-400'}`}>{label}</div>
    <div className={`text-sm font-bold ${!value ? 'italic opacity-30 font-normal' : ''}`}>
      {value || 'Awaiting input...'}
    </div>
  </div>
);

export default App;