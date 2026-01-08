
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

    if (!textOverride) setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);

    try {
      const result = await processUnderwritingStep(history, userText);
      
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: result.nextQuestion,
        agentActions: result.agentActions,
        isQuote: result.showQuote,
        options: result.options
      }]);
      
      setUnderwritingState(result.state);
      setHistory(prev => [
        ...prev, 
        { role: 'user', parts: [{ text: userText }] },
        { role: 'model', parts: [{ text: JSON.stringify(result) }] }
      ]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble processing that. Could you try again?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const startApplication = () => {
    setView(AppView.MEDICAL_SELECTION);
  };

  const selectIndividualLife = () => {
    setView(AppView.CHAT);
  };

  const handleAcceptQuote = () => {
    setView(AppView.PAYMENT);
  };

  const handlePayment = () => {
    setIsTyping(true);
    setTimeout(() => {
      setPaymentSuccess(true);
      setView(AppView.POLICY);
      setIsTyping(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 flex flex-col">
        {view === AppView.LANDING && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <h1 className="text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
              Insurance at the speed of <span className="text-purple-600">Agents</span>.
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12">
              AuraLife leverages multi-agent AI to provide medical-grade underwriting in seconds, not weeks. Fully transparent, fully auditable.
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-6">
              <button 
                onClick={startApplication}
                className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-slate-800 transition shadow-lg"
              >
                Individual Term Life
              </button>
              <button className="bg-white border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-slate-50 transition shadow-sm">
                Group Life Coverage
              </button>
            </div>
          </div>
        )}

        {view === AppView.MEDICAL_SELECTION && (
          <div className="max-w-4xl mx-auto px-4 py-16 w-full">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Select Product Path</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div 
                onClick={selectIndividualLife}
                className="group p-8 bg-white border border-slate-200 rounded-3xl hover:border-purple-500 cursor-pointer transition-all hover:shadow-xl"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition">
                  🩺
                </div>
                <h3 className="text-xl font-bold mb-2">Individual Medical</h3>
                <p className="text-slate-500 text-sm">Full conversational underwriting for individuals with complex medical history.</p>
              </div>
              <div className="group p-8 bg-slate-100 border border-slate-200 rounded-3xl opacity-60 cursor-not-allowed">
                <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400 mb-6">
                  🏢
                </div>
                <h3 className="text-xl font-bold mb-2">Non-Medical (Basic)</h3>
                <p className="text-slate-500 text-sm">Automated scoring for healthy applicants. (Coming Soon)</p>
              </div>
            </div>
          </div>
        )}

        {view === AppView.CHAT && (
          <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col p-4">
            <div className="bg-white rounded-3xl shadow-xl flex-1 flex flex-col overflow-hidden border border-slate-200">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white agent-pulse">A</div>
                  <div>
                    <h3 className="font-bold text-slate-900">Underwriting Orchestrator</h3>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> 
                      Active Multi-Agent Workflow
                    </p>
                  </div>
                </div>
                <div className="hidden sm:block text-xs text-slate-400">
                  Ref: AL-29381-UW
                </div>
              </div>

              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
              >
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} flex-col gap-2`}>
                    <div className={`max-w-[85%] px-5 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-tr-none self-end' : 'bg-slate-100 text-slate-800 rounded-tl-none self-start'}`}>
                      {msg.text}
                    </div>
                    {msg.role === 'model' && msg.options && (
                      <div className="flex flex-wrap gap-2 mt-2 self-start max-w-[90%]">
                        {msg.options.map((opt, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(opt)}
                            disabled={isTyping}
                            className="px-4 py-2 bg-white border border-purple-200 text-purple-600 rounded-full text-sm font-medium hover:bg-purple-50 hover:border-purple-400 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                    {msg.agentActions && (
                      <div className="max-w-[95%] self-start w-full">
                        <AgentDisplay actions={msg.agentActions} />
                      </div>
                    )}
                    {msg.isQuote && (
                      <div className="mt-4 bg-white border-2 border-purple-500 rounded-2xl p-6 shadow-lg animate-in zoom-in-95 duration-500">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-2xl font-bold text-slate-900">Personalized Quote</h4>
                          <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded">MKT ESTIMATE</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-[10px] uppercase text-slate-400 font-bold block">Annual Premium</span>
                            <span className="text-2xl font-black text-purple-600">${underwritingState.annualPremium?.toLocaleString()}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-[10px] uppercase text-slate-400 font-bold block">Sum Assured</span>
                            <span className="text-2xl font-black text-slate-800">${underwritingState.amount?.toLocaleString()}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mb-6 italic">This premium includes a {Math.round((underwritingState.riskMultiplier! - 1) * 100)}% medical loading based on disclosure of controlled conditions.</p>
                        <button 
                          onClick={handleAcceptQuote}
                          className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition"
                        >
                          Accept & Proceed to Issuance
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 px-5 py-3 rounded-2xl rounded-tl-none animate-pulse text-slate-400 text-sm">
                      Agents are processing your response...
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-200 bg-white">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your response or select an option above..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 pr-16 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-slate-800"
                  />
                  <button 
                    onClick={() => handleSendMessage()}
                    disabled={isTyping}
                    className="absolute right-2 bg-purple-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-purple-700 transition shadow-md disabled:opacity-50"
                  >
                    →
                  </button>
                </div>
                <p className="text-[10px] text-center text-slate-400 mt-2">
                  AuraLife uses secure, multi-agent AI. Data is encrypted and compliant with medical privacy standards.
                </p>
              </div>
            </div>
          </div>
        )}

        {view === AppView.PAYMENT && (
          <div className="max-w-md mx-auto py-12 px-4 w-full">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-6">Demo Payment Gateway</h3>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500">Plan</span>
                    <span className="font-bold">Term Life Pro</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500">Sum Assured</span>
                    <span className="font-bold">${underwritingState.amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-lg">
                    <span className="text-slate-900 font-bold">Total Due</span>
                    <span className="text-purple-600 font-black">${underwritingState.annualPremium?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="text-xs text-slate-400 mb-2 uppercase font-bold tracking-wider">Payment Method</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">💳</span>
                        <span className="font-medium">•••• •••• •••• 4242</span>
                      </div>
                      <span className="text-xs text-purple-600 font-bold">CHANGE</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handlePayment}
                    disabled={isTyping}
                    className={`w-full py-4 rounded-2xl font-bold text-white transition shadow-lg ${isTyping ? 'bg-slate-400' : 'bg-purple-600 hover:bg-purple-700'}`}
                  >
                    {isTyping ? 'Authorizing...' : `Pay $${underwritingState.annualPremium?.toLocaleString()}`}
                  </button>
                </div>
              </div>
              <div className="bg-slate-50 p-4 text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">128-Bit Encryption Secure</p>
              </div>
            </div>
          </div>
        )}

        {view === AppView.POLICY && (
          <div className="flex-1 max-w-5xl mx-auto w-full p-8 animate-in slide-in-from-bottom-10 duration-700">
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Policy Issued Successfully</h2>
                <p className="text-slate-500">Your coverage is now active. Ref: {underwritingState.policyNumber || 'AURA-X9928'}</p>
              </div>
              <div className="flex gap-4">
                <button className="bg-white border border-slate-200 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition shadow-sm">
                  <span>📥</span> Download PDF
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition shadow-md"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
            <PolicyPDF state={underwritingState} />
          </div>
        )}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 text-white mb-4">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
              <span className="text-xl font-bold tracking-tight">AuraLife</span>
            </div>
            <p className="max-w-md text-sm leading-relaxed">
              AuraLife Assurance is a digital-first life insurer using advanced generative AI to streamline risk assessment and policy issuance. This interface is a demonstration of agentic underwriting orchestration.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Individual Term</a></li>
              <li><a href="#" className="hover:text-white transition">Whole Life</a></li>
              <li><a href="#" className="hover:text-white transition">Accelerated UW</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition">Regulatory Filings</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
