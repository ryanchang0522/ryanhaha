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

export interface RecipeStep {
  instruction: string;
}

export interface NutritionInfo {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}

export interface RecipeData {
  recipeName: string;
  description: string;
  ingredients: string[];
  steps: RecipeStep[];
  allergens: string;
  nutrition: NutritionInfo;
}

export interface SavedRecipe extends RecipeData {
    id: string;
    imageUrl: string | null;
}

export interface AppSettings {
  enabled: boolean;
  days: number;
  apiKey?: string;
}


// New types for Community Sharing
export enum ShareType {
    Gift = '食材贈送',
    CoCook = '邀人共煮',
    CoEat = '尋找夥伴共食',
    Assistance = '需要志工協助',
}

export enum UserRole {
    Standard = 'Standard',
    Volunteer = 'Volunteer',
    Senior = 'Senior',
}

export interface UserProfile {
    id: string;
    name: string;
    avatarUrl?: string;
    role: UserRole;
    friends: string[];
    onlineStatus?: 'online' | 'offline';
}

export interface ShareEvent {
    id: string;
    type: 'food';
    initiator: UserProfile;
    item: FoodItem;
    shareType: ShareType;
    description: string;
    location: {
        latitude: number;
        longitude: number;
    };
    createdAt: Date;
    isOwn?: boolean;
}

export interface SharedRecipePost {
    id: string;
    type: 'recipe';
    initiator: UserProfile;
    recipe: SavedRecipe;
    description: string;
    location: {
        latitude: number;
        longitude: number;
    };
    createdAt: Date;
    isOwn?: boolean;
}

export type CommunityPost = ShareEvent | SharedRecipePost;