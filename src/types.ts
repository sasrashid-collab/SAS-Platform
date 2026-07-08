export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number; // IQD
  priceFormatted: string;
  description: string;
  features: string[];
  limitGames: number;
  limitWebsites: number;
  limitApps: number;
}

export interface ActivePlan {
  planId: string;
  name: string;
  remainingGames: number;
  remainingWebsites: number;
  remainingApps: number;
  tokenCount: number;
  isTrial: boolean;
  trialStart: string;
  trialEnd: string;
  expirationDate: string | null;
}

export interface DigitalProduct {
  id: string;
  name: string;
  description: string;
  type: "app" | "website" | "3d-game";
  html: string;
  features: string[];
  accentColor: string;
  prompt: string;
  creatorEmail: string;
  createdAt: string;
  price: number; // For marketplace sale
  isPublished: boolean;
  salesCount: number;
}

export interface GeneratedAd {
  id: string;
  productId: string;
  productName: string;
  platform: "tiktok" | "instagram" | "facebook";
  headline: string;
  adCopy: string;
  visualPrompt: string;
  pricingHighlight: string;
  watermarkText: string;
  isPublishedToStore: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export interface Invoice {
  id: string;
  planId: string;
  planName: string;
  amount: number;
  paymentMethod: "FIB" | "FastPay";
  status: "pending" | "approved" | "rejected";
  invoiceDate: string;
  transactionId: string;
  userEmail: string;
  whatsappSent: boolean;
  receiptScreenshot?: string;
  verifiedAt?: string;
}
