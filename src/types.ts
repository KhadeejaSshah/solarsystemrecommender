export type HouseType = 'house';

export interface Appliance {
  id: string;
  name: string;
  icon: string;
  wattage: number;
  quantity: number;
  options?: {
    label: string;
    value: any;
  }[];
  selectedOption?: any;
}

export interface EVInfo {
  status: 'own' | 'planning' | 'none';
  batterySize?: number; // in kWh
  carModel?: string;
  bikeModel?: string;
}

export interface UserDetails {
  name: string;
  email: string;
  address: string;
  phone: string;
}

export type EntryPath = 'appliances' | 'bill' | 'modern-home';
export type UsageBehavior = 'day-heavy' | 'night-heavy' | 'balanced';
export type BackupPreference = number | 'full'; // number of hours or 'full'

export interface UserData {
  details: UserDetails;
  entryPath: EntryPath;
  houseType: HouseType;
  appliances: Appliance[];
  evInfo: EVInfo;
  usageBehavior: UsageBehavior;
  backupPreference: BackupPreference;
  budgetSensitivity: number;
  monthlyBill?: number;
  monthlyUnits?: number;
}

export const APPLIANCES_LIST: Omit<Appliance, 'quantity'>[] = [
  { 
    id: 'fan', 
    name: 'Ceiling Fan', 
    icon: 'fan', 
    wattage: 80,
    options: [
      { label: 'Standard (80W)', value: 80 },
      { label: 'Energy Saver (50W)', value: 50 },
      { label: 'DC Inverter (30W)', value: 30 }
    ]
  },
  { 
    id: 'ac', 
    name: 'Air Conditioner', 
    icon: 'ac', 
    wattage: 1800,
    options: [
      { label: '1.0 Ton (1200W)', value: 1200 },
      { label: '1.5 Ton (1800W)', value: 1800 },
      { label: '2.0 Ton (2400W)', value: 2400 }
    ]
  },
  { 
    id: 'fridge', 
    name: 'Refrigerator', 
    icon: 'fridge', 
    wattage: 300,
    options: [
      { label: 'Small/Single Door', value: 150 },
      { label: 'Medium/Double Door', value: 300 },
      { label: 'Large/French Door', value: 500 }
    ]
  },
  { 
    id: 'lights', 
    name: 'LED Lights', 
    icon: 'lights', 
    wattage: 60 
  },
  { 
    id: 'motor', 
    name: 'Water Motor', 
    icon: 'motor', 
    wattage: 746,
    options: [
      { label: '0.5 HP', value: 373 },
      { label: '1.0 HP', value: 746 },
      { label: '1.5 HP', value: 1119 },
      { label: '2.0 HP', value: 1492 }
    ]
  },
  { 
    id: 'tv', 
    name: 'LED TV', 
    icon: 'tv', 
    wattage: 100 
  },
  { 
    id: 'iron', 
    name: 'Electric Iron', 
    icon: 'iron', 
    wattage: 1000 
  },
  { 
    id: 'microwave', 
    name: 'Microwave Oven', 
    icon: 'microwave', 
    wattage: 1200 
  },
];

export const PAKISTAN_CONSTANTS = {
  AVG_PEAK_SUN_HOURS: 5,
  TARIFF_RATE: 55, // PKR per unit
  NET_METERING_EFFICIENCY: 0.9,
  PANEL_WATTAGE: 550, // Standard 550W panels
};
