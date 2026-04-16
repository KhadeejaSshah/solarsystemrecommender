import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserDetails } from '../types';

interface UserDetailsStepProps {
  onComplete: (details: UserDetails & { city: string }) => void;
}

const CITIES = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Peshawar", 
  "Quetta", "Faisalabad", "Multan", "Sialkot", "Other"
];

export default function UserDetailsStep({ onComplete }: UserDetailsStepProps) {
  const [details, setDetails] = useState({
    name: '',
    address: '',
    phone: '',
    city: ''
  });

  // Phone is no longer optional, all fields required
  const isValid = details.name && details.address && details.phone && details.city;

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center pt-12 px-6 font-sans">
      {/* Progress Trail */}
      <div className="flex items-center gap-3 mb-16">
        <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></div>
        <div className="w-16 h-[1px] bg-slate-800"></div>
        <div className="w-2 h-2 rounded-full bg-slate-800"></div>
        <div className="w-16 h-[1px] bg-slate-800"></div>
        <div className="w-2 h-2 rounded-full bg-slate-800"></div>
        <div className="w-16 h-[1px] bg-slate-800"></div>
        <div className="w-2 h-2 rounded-full bg-slate-800"></div>
      </div>

      <div className="w-full max-w-md">
        <header className="mb-12">
          <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase mb-2">
            Your Details
          </h1>
          <p className="text-slate-500 text-lg">
            Quick setup — no account needed.
          </p>
        </header>

        <div className="space-y-8">
          {/* Full Name */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">Full Name</label>
            <input
              type="text"
              placeholder="Ahmed Hassan"
              value={details.name}
              onChange={(e) => setDetails(d => ({ ...d, name: e.target.value }))}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-5 px-6 text-white placeholder:text-slate-700 focus:outline-none focus:border-cyan-500/50 transition-all text-lg"
            />
          </div>

          {/* Property Address */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">Property Address</label>
            <input
              type="text"
              placeholder="House 42, Block C, DHA"
              value={details.address}
              onChange={(e) => setDetails(d => ({ ...d, address: e.target.value }))}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-5 px-6 text-white placeholder:text-slate-700 focus:outline-none focus:border-cyan-500/50 transition-all text-lg"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">Phone Number</label>
            <input
              type="tel"
              placeholder="+92 300 1234567"
              value={details.phone}
              onChange={(e) => setDetails(d => ({ ...d, phone: e.target.value }))}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-5 px-6 text-white placeholder:text-slate-700 focus:outline-none focus:border-cyan-500/50 transition-all text-lg"
            />
          </div>

          {/* City Dropdown */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">City</label>
            <div className="relative">
              <select
                value={details.city}
                onChange={(e) => setDetails(d => ({ ...d, city: e.target.value }))}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-5 px-6 text-white appearance-none focus:outline-none focus:border-cyan-500/50 transition-all text-lg cursor-pointer"
              >
                <option value="" disabled className="bg-slate-900">Select City</option>
                {CITIES.map(city => (
                  <option key={city} value={city} className="bg-slate-900">{city}</option>
                ))}
              </select>
              {/* Custom Arrow */}
              <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="pt-6">
            <button
              disabled={!isValid}
              onClick={() => onComplete(details as any)}
              className={`w-full py-5 rounded-full font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2
                ${isValid 
                  ? 'bg-slate-800 text-white hover:bg-slate-700 cursor-pointer' 
                  : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                }`}
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}