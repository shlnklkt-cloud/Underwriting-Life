
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">AuraLife</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-purple-600">Solutions</a>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-purple-600">Company</a>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-purple-600">Claims</a>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-purple-600">Support</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-slate-700">Log in</button>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-purple-700 transition">Get Started</button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
