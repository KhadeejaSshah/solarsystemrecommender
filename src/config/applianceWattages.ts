/**
 * =================================================================
 * APPLIANCE WATTAGE CONFIGURATION
 * =================================================================
 * This file is the single source of truth for the power consumption (in watts)
 * of every appliance variant used in the application.
 *
 * Structure:
 * - The top-level key is the appliance's unique identifier (e.g., 'ac', 'fridge').
 *   This should match the 'id' field in the CATEGORIES array in App.tsx.
 * - The nested key is the variant's unique key (e.g., '1-ton', 'small').
 *   This should match the 'key' field in the 'variants' array for that item.
 */

export const APPLIANCE_WATTAGE_CONFIG: Record<string, Record<string, number>> = {
  ac: {
    '1-ton': 1250,
    '1.5-ton': 1800,
    '2-ton': 2400,
  },
  fan: {
    'standard': 80,
  },
  fridge: {
    'small': 150,
    'medium': 300,
    'large': 500,
  },
  microwave: {
    'standard': 1200,
  },
  motor: {
    '1hp': 746,
  },
  tv: {
    'std': 100,
  },
  lights: {
    'std': 60,
  },
  tesla: {
    'ev': 7200,
  },
  bike: {
    'ebike': 500,
  },
};