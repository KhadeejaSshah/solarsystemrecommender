export interface ApplianceCounts {
  ac15: number;
  ac20: number;
  fan: number;
  light: number;
  fridge: number;
  motor: number;
}

export interface CalculationResult {
  monthlyUnits: number;
  dailyUnits: number;
  suggestedPv: number;
  suggestedInverter: number;
  suggestedBattery: number;
}

export type InputMode = 'bill' | 'units' | 'appliances' | null;
