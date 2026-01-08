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

    // Direct transition for payment
    if (userText === "Proceed to payment") {
      setView(AppView.PAYMENT);
      return;
    }

    if (!textOverride) setInput('');
    
    // Add user message to UI immediately
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
        text: "I encountered a slight issue processing that. Could you please try re-entering your last answer?" 
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
            Future of Underwriting
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight text-slate-900">
            Life insurance as <span className="text-purple-600">fast as you are.</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
            Meet Aura, our multi-agent AI orchestrator. Get fully underwritten term life insurance in minutes, not weeks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setView(AppView.CHAT)}
              className="bg-purple-600 text-white px-10 py-4 rounded-full text-lg font-bold hover:bg-purple-700 transition-all shadow-lg hover:shadow-purple-200"
            >
              Start Your Quote
            </button>
            <button className="bg-white text-slate-900 border border-slate-200 px-10 py-4 rounded-full text-lg font-bold hover:bg-slate-50 transition-all">
              Learn More
            </button>
          </div>
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50">
            <div className="font-bold text-xl uppercase tracking-widest">ISO 27001</div>
            <div className="font-bold text-xl uppercase tracking-widest">GDPR</div>
            <div className="font-bold text-xl uppercase tracking-widest">HIPAA</div>
            <div className="font-bold text-xl uppercase tracking-widest">SOC2</div>
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
          <div className="bg-green-600 text-white p-6 rounded-t-3xl flex justify-between items-center">
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
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">A</div>
              <div>
                <h2 className="font-bold text-slate-800 leading-none">Aura Underwriter</h2>
                <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">● Real-time Processing</span>
              </div>
            </div>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth pb-32">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.agentActions && <AgentDisplay actions={msg.agentActions} />}
                <div className={`max-w-[85%] rounded-2xl p-4 ${
                  msg.role === 'user' 
                    ? 'bg-purple-600 text-white rounded-tr-none' 
                    : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
                {msg.options && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {msg.options.map((opt, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleSendMessage(opt)}
                        className="px-4 py-2 bg-white border border-purple-200 text-purple-700 rounded-full text-xs font-semibold hover:bg-purple-50 transition-all shadow-sm"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex flex-col items-start">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 flex gap-2 items-center">
                   <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                   <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                   <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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
                placeholder="Type your answer here..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
              <button 
                onClick={() => handleSendMessage()}
                disabled={isTyping}
                className="bg-purple-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-purple-700 transition shadow-lg shadow-purple-200 disabled:opacity-50"
              >
                ➔
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Status (Desktop only) */}
        <div className="hidden lg:flex w-80 bg-slate-50 flex-col p-6 overflow-y-auto border-r border-slate-200">
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
                All agent decisions are recorded on an immutable ledger for regulatory compliance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ProfileItem helper component
const ProfileItem: React.FC<{ label: string; value?: string | number; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className={`p-3 rounded-xl border ${highlight ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
    <div className={`text-[10px] uppercase font-bold ${highlight ? 'text-purple-200' : 'text-slate-400'}`}>{label}</div>
    <div className={`text-sm font-bold ${!value ? 'italic opacity-30 font-normal' : ''}`}>
      {value || 'Awaiting input...'}
    </div>
  </div>
);

export default App;