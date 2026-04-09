import { useState } from 'react';
import { motion } from 'motion/react';
import StepWrapper from './StepWrapper';
import { UserDetails } from '../types';
import { User, Mail, MapPin, Phone } from 'lucide-react';

interface UserDetailsStepProps {
  onComplete: (details: UserDetails) => void;
}

export default function UserDetailsStep({ onComplete }: UserDetailsStepProps) {
  const [details, setDetails] = useState<UserDetails>({
    name: '',
    email: '',
    address: '',
    phone: '',
  });

  const isValid = details.name && details.email && details.address && details.phone;

  return (
    <div className="flex flex-col items-center">
      <StepWrapper direction="top">
        <h2 className="text-3xl font-display font-bold text-white mb-2 text-center">
          Personal Details
        </h2>
        <p className="text-white/50 mb-8 text-center">Let's start by getting to know you.</p>

        <div className="space-y-4">
          <InputGroup 
            icon={User} 
            placeholder="Full Name" 
            value={details.name} 
            onChange={(v) => setDetails(d => ({ ...d, name: v }))} 
          />
          <InputGroup 
            icon={Mail} 
            placeholder="Email Address" 
            type="email"
            value={details.email} 
            onChange={(v) => setDetails(d => ({ ...d, email: v }))} 
          />
          <InputGroup 
            icon={Phone} 
            placeholder="Phone Number" 
            value={details.phone} 
            onChange={(v) => setDetails(d => ({ ...d, phone: v }))} 
          />
          <div className="relative group">
            <div className="absolute top-4 left-4 text-white/30 group-focus-within:text-solar-orange transition-colors">
              <MapPin className="w-5 h-5" />
            </div>
            <textarea
              placeholder="Installation Address"
              value={details.address}
              onChange={(e) => setDetails(d => ({ ...d, address: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-solar-orange/50 focus:ring-1 focus:ring-solar-orange/50 transition-all min-h-[100px] resize-none"
            />
          </div>

          <div className="pt-4">
            <button 
              disabled={!isValid}
              onClick={() => onComplete(details)}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </div>
      </StepWrapper>
    </div>
  );
}

function InputGroup({ icon: Icon, placeholder, value, onChange, type = "text" }: any) {
  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-4 flex items-center text-white/30 group-focus-within:text-solar-orange transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-solar-orange/50 focus:ring-1 focus:ring-solar-orange/50 transition-all"
      />
    </div>
  );
}
