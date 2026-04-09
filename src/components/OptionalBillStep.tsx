import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import StepWrapper from './StepWrapper';
import { FileText, Zap, ChevronRight, Upload, CheckCircle2 } from 'lucide-react';

interface OptionalBillStepProps {
  onComplete: (data: { monthlyUnits?: number; monthlyBill?: number }) => void;
}

export default function OptionalBillStep({ onComplete }: OptionalBillStepProps) {
  const [units, setUnits] = useState<string>('');
  const [bill, setBill] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    onComplete({
      monthlyUnits: units ? parseInt(units) : undefined,
      monthlyBill: bill ? parseInt(bill) : undefined,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <StepWrapper direction="right" className="max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold text-solar-text mb-2">
          Final Details (Optional)
        </h2>
        <p className="text-solar-text/60">
          Providing your bill details helps us refine the financial ROI.
        </p>
      </div>

      <div className="space-y-6">
        {/* Bill Upload */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-solar-text/60 ml-1">
            Upload a Bill (Optional)
          </label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-solar-text/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-solar-electric/30 hover:bg-solar-electric/5 cursor-pointer transition-all"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*,application/pdf"
            />
            {file ? (
              <>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
                <span className="text-sm font-medium text-solar-text">{file.name}</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-solar-electric" />
                <div className="text-center">
                  <p className="text-sm font-medium text-solar-text">Click to upload bill</p>
                  <p className="text-xs text-solar-text/40">PDF, JPG or PNG</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-solar-text/60 ml-1">
            Average Monthly Units
          </label>
          <div className="relative">
            <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-solar-electric" />
            <input
              type="number"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              placeholder="e.g. 500"
              className="w-full bg-white border border-solar-text/10 rounded-2xl py-4 pl-12 pr-4 text-solar-text focus:border-solar-electric focus:ring-1 focus:ring-solar-electric outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-solar-text/60 ml-1">
            Average Monthly Bill (PKR)
          </label>
          <div className="relative">
            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-solar-electric" />
            <input
              type="number"
              value={bill}
              onChange={(e) => setBill(e.target.value)}
              placeholder="e.g. 25000"
              className="w-full bg-white border border-solar-text/10 rounded-2xl py-4 pl-12 pr-4 text-solar-text focus:border-solar-electric focus:ring-1 focus:ring-solar-electric outline-none transition-all"
            />
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <button
            onClick={handleSubmit}
            className="btn-primary w-full py-4 flex items-center justify-center gap-2 group"
          >
            Finalize Design
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={handleSubmit}
            className="w-full text-center text-sm text-solar-text/40 hover:text-solar-text transition-colors"
          >
            Skip and see results
          </button>
        </div>
      </div>
    </StepWrapper>
  );
}
