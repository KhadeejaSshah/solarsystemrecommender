export type HouseType = 'house';

export interface Appliance {
  id: string;
  name: string;
  icon: string;
  wattage: number;
  quantity: number;
}

export interface EVInfo {
  hasCar: boolean;
  carModel?: string;
  hasBike: boolean;
  bikeModel?: string;
}

export interface UserDetails {
  name: string;
  email: string;
  address: string;
  phone: string;
}

export type EntryPath = 'upload-bill' | 'monthly-units' | 'appliances';
export type UsageBehavior = 'day-heavy' | 'night-heavy' | 'balanced';
export type BackupPreference = '2h' | '4h' | 'full';

export interface UserData {
  details: UserDetails;
  entryPath: EntryPath;
  houseType: HouseType;
  appliances: Appliance[];
  evInfo: EVInfo;
  usageBehavior: UsageBehavior;
  backupPreference: BackupPreference;
  budgetSensitivity: number;
  monthlyBill: number;
  monthlyUnits: number;
}

export const APPLIANCES_LIST: Omit<Appliance, 'quantity'>[] = [
  { id: 'fan', name: 'Ceiling Fan', icon: '🌀', wattage: 80 },
  { id: 'ac', name: 'Air Conditioner (1.5 Ton)', icon: '❄️', wattage: 1800 },
  { id: 'fridge', name: 'Refrigerator', icon: '🧊', wattage: 300 },
  { id: 'lights', name: 'LED Lights (Set of 5)', icon: '💡', wattage: 60 },
  { id: 'motor', name: 'Water Motor', icon: '🚰', wattage: 1000 },
  { id: 'tv', name: 'LED TV', icon: '📺', wattage: 150 },
  { id: 'iron', name: 'Electric Iron', icon: '🔌', wattage: 1000 },
  { id: 'microwave', name: 'Microwave Oven', icon: '🍱', wattage: 1200 },
];

export const PAKISTAN_CONSTANTS = {
  AVG_PEAK_SUN_HOURS: 5,
  TARIFF_RATE: 55, // PKR per unit
  NET_METERING_EFFICIENCY: 0.9,
  PANEL_WATTAGE: 550, // Standard 550W panels
};
