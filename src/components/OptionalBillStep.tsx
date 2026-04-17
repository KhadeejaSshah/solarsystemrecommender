import { useState, useRef } from 'react';
import StepWrapper from './StepWrapper';
import { FileText, ChevronRight, Upload, CheckCircle2 } from 'lucide-react';

interface OptionalBillStepProps {
  onComplete: (data: { monthlyUnits?: number; monthlyBill?: number }) => void;
}

export default function OptionalBillStep({ onComplete }: OptionalBillStepProps) {

  const [units, setUnits] = useState<string>('');
  const [bill, setBill] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);


  // -------------------------
  // Upload to backend
  // -------------------------
  const uploadBill = async (file: File) => {

    const formData = new FormData();
    formData.append("file", file);

    try {

      setLoading(true);

      const response = await fetch(
        "http://localhost:8000/upload-bill",
        {
          method: "POST",
          body: formData
        }
      );

      const data = await response.json();

      console.log("Bill Extracted:", data);

      // Optional auto fill
      try {

        const parsed = JSON.parse(data.data);

        if (parsed.units_consumed) {
          setUnits(parsed.units_consumed.toString());
        }

        if (parsed.amount_within_due) {
          setBill(parsed.amount_within_due.toString());
        }

      } catch (e) {
        console.log("Could not parse AI response");
      }

    } catch (error) {
      console.error("Upload error", error);
    }

    setLoading(false);
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    if (e.target.files && e.target.files[0]) {

      const selected = e.target.files[0];

      setFile(selected);

      uploadBill(selected);
    }
  };


  const handleSubmit = () => {

    onComplete({
      monthlyUnits: units ? parseInt(units) : undefined,
      monthlyBill: bill ? parseInt(bill) : undefined,
    });
  };


  return (
    <StepWrapper direction="right" className="max-w-md">

      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold text-solar-text mb-2">
           Electricity Bill
        </h2>

        <p className="text-solar-text/60">
          Upload your electricity bill for accurate recommendation
        </p>
      </div>


      <div className="space-y-6">

        {/* Upload */}
        <div>

          <label className="text-xs font-bold uppercase tracking-widest text-solar-text/60">
            Upload Bill
          </label>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer hover:border-solar-electric"
          >

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,application/pdf"
            />

            {loading && (
              <div>
                Extracting bill...
              </div>
            )}

            {!loading && file && (
              <>
                <CheckCircle2 className="mx-auto w-8 h-8 text-green-500" />
                <p>{file.name}</p>
              </>
            )}

            {!file && !loading && (
              <>
                <Upload className="mx-auto w-8 h-8 text-solar-electric" />
                <p>Click to upload bill</p>
              </>
            )}

          </div>

        </div>


        {/* Monthly Bill */}

        {/* <div>

          <label>Monthly Bill</label>

          <input
            type="number"
            value={bill}
            onChange={(e) => setBill(e.target.value)}
            className="w-full border rounded-xl p-3"
          />

        </div> */}


        {/* Continue */}

        <button
          onClick={handleSubmit}
          className="btn-primary w-full py-4"
        >
          Finalize
        </button>

      </div>

    </StepWrapper>
  );
}
