export interface ServicePriceRule {
  name: string;
  basePrice: number;
  baseHours: number;
  extraHourPrice: number;
  description: string;
}

export const DEFAULT_SERVICES_PRICING: Record<string, ServicePriceRule> = {
  "Dining Out": {
    name: "Dining Out",
    basePrice: 1999,
    baseHours: 2,
    extraHourPrice: 600,
    description: "Enjoy high-end food, cafe spots, or local food streets with an amazing conversationalist."
  },
  "Movies & Cinema": {
    name: "Movies & Cinema",
    basePrice: 2499,
    baseHours: 2,
    extraHourPrice: 800,
    description: "Watch the latest blockbuster at the cinema or stream your favorite movies with cozy company."
  },
  "Call Companionship": {
    name: "Call Companionship",
    basePrice: 1499,
    baseHours: 2,
    extraHourPrice: 300,
    description: "Cure your loneliness with an intimate, sweet voice over a warm and discreet phone call."
  },
  "Spending a Day Together": {
    name: "Spending a Day Together",
    basePrice: 9999,
    baseHours: 8,
    extraHourPrice: 1500,
    description: "Full day of tailored luxury company, city tour, and dining. Includes everything for one person."
  },
  "Spending a Night Together": {
    name: "Spending a Night Together",
    basePrice: 14999,
    baseHours: 8,
    extraHourPrice: 2000,
    description: "Discreet premium overnight stay. Includes matching companion company and everything you want."
  },
  "Study Together": {
    name: "Study Together",
    basePrice: 1499,
    baseHours: 2,
    extraHourPrice: 500,
    description: "Read, study, prepare for exams, or review any book together in a productive environment."
  }
};

export const SERVICES_PRICING = DEFAULT_SERVICES_PRICING;

export function getServicesPricing(): Record<string, ServicePriceRule> {
  try {
    const saved = localStorage.getItem('yaarana_services_pricing');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error("Error reading dynamic services pricing:", err);
  }
  return { ...DEFAULT_SERVICES_PRICING };
}

export function saveServicesPricing(pricing: Record<string, ServicePriceRule>): void {
  try {
    localStorage.setItem('yaarana_services_pricing', JSON.stringify(pricing));
  } catch (err) {
    console.error("Error saving dynamic services pricing:", err);
  }
}

export const ALL_SERVICES = [
  "Dining Out",
  "Movies & Cinema",
  "Call Companionship",
  "Spending a Day Together",
  "Spending a Night Together",
  "Study Together"
];

export function calculateBookingPrice(activity: string, duration: number, customPricing?: Record<string, ServicePriceRule>): number {
  const currentPricing = customPricing || getServicesPricing();
  const rule = currentPricing[activity];
  if (!rule) return 0;
  
  const basePrice = rule.basePrice;
  const baseHours = rule.baseHours;
  const extraHours = Math.max(0, duration - baseHours);
  
  return basePrice + (extraHours * rule.extraHourPrice);
}

