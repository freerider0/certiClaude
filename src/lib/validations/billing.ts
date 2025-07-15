import { z } from 'zod';

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 49,
    certificates: 10,
    features: ['Email support', 'Basic templates']
  },
  pro: {
    id: 'pro',
    name: 'Professional',
    price: 99,
    certificates: 30,
    features: ['Priority support', 'Advanced templates', 'API access']
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    certificates: 100,
    features: ['24/7 support', 'Custom templates', 'API access', 'Custom integrations']
  }
} as const;

// Credit packages
export const CREDIT_PACKAGES = [
  { id: 'pack_5', credits: 5, price: 25, perCredit: 5 },
  { id: 'pack_10', credits: 10, price: 45, perCredit: 4.5, badge: 'Popular', savings: '10%' },
  { id: 'pack_20', credits: 20, price: 80, perCredit: 4, badge: 'Best Value', savings: '20%' }
] as const;

// Subscription form schema
export const subscriptionFormSchema = z.object({
  planId: z.enum(['basic', 'pro', 'enterprise'], {
    required_error: "Please select a subscription plan"
  }),
  
  // Payment details (card validation happens in Stripe Elements)
  saveCard: z.boolean().default(true),
  
  // Billing address
  billingAddress: z.object({
    line1: z.string().min(1, "Address is required"),
    line2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().optional(),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().default('ES')
  }),

  // Optional VAT for business customers
  vatNumber: z.string()
    .regex(/^ES[A-Z]\d{7}[A-Z0-9]$/, "Invalid Spanish VAT number")
    .optional()
    .or(z.literal(''))
});

export type SubscriptionFormData = z.infer<typeof subscriptionFormSchema>;

// Credit purchase schema
export const creditPurchaseSchema = z.object({
  packageId: z.enum(['pack_5', 'pack_10', 'pack_20'], {
    required_error: "Please select a credit package"
  }),
  
  paymentMethodId: z.string().optional(), // For saved cards
  saveNewCard: z.boolean().default(false),
  
  // For receipts
  receiptEmail: z.string().email("Invalid email address").optional().or(z.literal(''))
});

export type CreditPurchaseData = z.infer<typeof creditPurchaseSchema>;

// Update subscription schema
export const updateSubscriptionSchema = z.object({
  newPlanId: z.enum(['basic', 'pro', 'enterprise']),
  
  // Only required for downgrades
  confirmDowngrade: z.boolean().optional()
}).refine(
  (data) => {
    // If it's a downgrade, confirmation is required
    const currentPlan = 'pro'; // This would come from current subscription
    const planOrder = { basic: 0, pro: 1, enterprise: 2 };
    const isDowngrade = planOrder[data.newPlanId] < planOrder[currentPlan];
    
    if (isDowngrade) {
      return data.confirmDowngrade === true;
    }
    return true;
  },
  {
    message: "You must confirm the downgrade terms",
    path: ["confirmDowngrade"]
  }
);

export type UpdateSubscriptionData = z.infer<typeof updateSubscriptionSchema>;

// API request schemas
export const createSubscriptionRequestSchema = z.object({
  planId: z.enum(['basic', 'pro', 'enterprise']),
  paymentMethodId: z.string(),
  saveCard: z.boolean(),
  billingAddress: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string().optional(),
    postalCode: z.string(),
    country: z.string()
  }),
  vatNumber: z.string().optional()
});

export const purchaseCreditsRequestSchema = z.object({
  packageId: z.enum(['pack_5', 'pack_10', 'pack_20']),
  paymentMethodId: z.string().optional(),
  saveCard: z.boolean().optional(),
  receiptEmail: z.string().email().optional()
});

// Helper to get plan details
export function getPlanDetails(planId: keyof typeof SUBSCRIPTION_PLANS) {
  return SUBSCRIPTION_PLANS[planId];
}

// Helper to get package details
export function getPackageDetails(packageId: string) {
  return CREDIT_PACKAGES.find(p => p.id === packageId);
}