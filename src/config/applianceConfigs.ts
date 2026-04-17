// Precise 3D coordinates for ModernHouseModel architecture
// Units are in Three.js world space

export type Vector3 = [number, number, number];

export const SLOT_MAP: Record<string, Vector3> = {
  // Climate Control
  ac: [4, 3.8, -1],              // Upper Floor Wing Wall
  fan: [1, 2.8, 3.1],            // Living Room Ceiling Mounted
  
  // Kitchen & Appliances
  fridge: [4.5, 1.2, 3],         // Ground Floor Kitchen Area
  microwave: [2, 1.2, 3],        // Ground Floor Counter Area
  motor: [-6, 0.4, 3],           // Near Island Utility Edge
  iron: [-4, 1, 1],              // Side Gallery
  
  // Home Entertainment
  tv: [-3, 1.6, 3.1],            // Glass Cantilever View Wall
  lights: [2.5, 4.2, -1],        // Upper Floor Loft
  
  // EV & Mobility
  tesla: [-8, 0.2, 0],           // Driveway / Island Surface
  bike: [-7, 0.2, -3],           // Garage Access Area
};

export const FALLBACK_SLOTS: Vector3[] = [
  [0, 2, 3.1],
  [-2, 2, 3.1],
  [2, 2, 3.1],
  [0, 4, -1],
];

export const UI_NAME_TO_ID: Record<string, string> = {
  'Air Conditioner': 'ac',
  'Ceiling Fan': 'fan',
  'Refrigerator': 'fridge',
  'Microwave Oven': 'microwave',
  'Water Motor': 'motor',
  'Electric Iron': 'iron',
  'LED TV': 'tv',
  'LED Lights': 'lights',
  'EV Car': 'tesla',
  'Electric Bike': 'bike'
};
