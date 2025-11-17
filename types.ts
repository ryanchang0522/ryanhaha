
export enum Location {
  Fridge = 'Fridge',
  Freezer = 'Freezer',
  Pantry = 'Pantry',
}

export enum Urgency {
  UseNow = 'Use Now',
  PlanSoon = 'Plan Soon',
  Safe = 'Safe',
}

export interface FoodItem {
  id: string;
  name: string;
  expiryDate: Date;
  location: Location;
  urgency: Urgency;
}
