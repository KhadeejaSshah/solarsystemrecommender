import { useState } from 'react';
import { motion } from 'motion/react';
import StepWrapper from './StepWrapper';
import { Upload, FileText, CheckCircle2, Loader2 } from 'lucide-react';

interface BillUploadStepProps {
  onComplete: (units: number) => void;
}

export default function BillUploadStep({ onComplete }: BillUploadStepProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleUpload = () => {
    setIsUploading(true);
    // Simulate AI extraction
    setTimeout(() => {
      setIsUploading(false);
      setIsDone(true);
      setTimeout(() => onComplete(650), 1500); // Mock 650 units
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center">
      <StepWrapper direction="bottom">
        <h2 className="text-3xl font-display font-bold text-white mb-2 text-center">
          Upload Bill
        </h2>
        <p className="text-white/50 mb-12 text-center">Our AI will extract your consumption data automatically.</p>

        <div className="flex flex-col items-center gap-8">
          {!isDone ? (
            <div 
              className={`w-full h-64 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 transition-all duration-300 ${
                isUploading ? 'border-solar-orange bg-solar-orange/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-12 h-12 text-solar-orange animate-spin" />
                  <p className="text-solar-orange font-mono animate-pulse">Analyzing bill structure...</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-white/40" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold">Click to upload or drag & drop</p>
                    <p className="text-xs text-white/30">Supports JPG, PNG, PDF (Max 5MB)</p>
                  </div>
                  <button onClick={handleUpload} className="btn-secondary mt-4">Select File</button>
                </>
              )}
            </div>
          ) : (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold">Extraction Successful</h3>
              <p className="text-white/50">Detected: <span className="text-white font-bold">650 Units</span> / Month</p>
            </motion.div>
          )}

          <div className="flex items-center gap-2 text-white/20 text-xs uppercase tracking-widest font-bold">
            <FileText className="w-4 h-4" />
            <span>Secure & Private</span>
          </div>
        </div>
      </StepWrapper>
    </div>
  );
}
