#!/usr/bin/env bun
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://vdwjfekcsnurtjsieojv.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const PLANS = [
  {
    slug: "starter",
    name: "Starter",
    description: "Perfect for getting started with AI calendar management",
    price_monthly_cents: 0,
    price_yearly_cents: 0,
    price_per_use_cents: 100,
    ai_interactions_monthly: 50,
    action_pack_size: 100,
    features: [
      "50 AI interactions/month",
      "Basic calendar management",
      "Email support",
      "Web chat interface",
    ],
    is_active: true,
    is_popular: false,
    is_highlighted: false,
    display_order: 1,
    lemonsqueezy_product_id: null,
    lemonsqueezy_variant_id_monthly: null,
    lemonsqueezy_variant_id_yearly: null,
  },
  {
    slug: "pro",
    name: "Pro",
    description: "For professionals who need more power and flexibility",
    price_monthly_cents: 400,
    price_yearly_cents: 2400,
    price_per_use_cents: 100,
    ai_interactions_monthly: 500,
    action_pack_size: 100,
    features: [
      "500 AI interactions/month",
      "Advanced scheduling",
      "Priority support",
      "Voice & Telegram integration",
      "Gap recovery analysis",
    ],
    is_active: true,
    is_popular: true,
    is_highlighted: false,
    display_order: 2,
    lemonsqueezy_product_id: process.env.LEMONSQUEEZY_PRO_PRODUCT_ID || null,
    lemonsqueezy_variant_id_monthly:
      process.env.LEMONSQUEEZY_PRO_VARIANT_MONTHLY || null,
    lemonsqueezy_variant_id_yearly:
      process.env.LEMONSQUEEZY_PRO_VARIANT_YEARLY || null,
  },
  {
    slug: "executive",
    name: "Executive",
    description: "Unlimited power for executives and teams",
    price_monthly_cents: 700,
    price_yearly_cents: 6000,
    price_per_use_cents: 100,
    ai_interactions_monthly: null,
    action_pack_size: 100,
    features: [
      "Unlimited AI interactions",
      "White-glove onboarding",
      "Dedicated support",
      "All integrations",
      "Custom workflows",
      "Team collaboration",
    ],
    is_active: true,
    is_popular: false,
    is_highlighted: true,
    display_order: 3,
    lemonsqueezy_product_id:
      process.env.LEMONSQUEEZY_EXECUTIVE_PRODUCT_ID || null,
    lemonsqueezy_variant_id_monthly:
      process.env.LEMONSQUEEZY_EXECUTIVE_VARIANT_MONTHLY || null,
    lemonsqueezy_variant_id_yearly:
      process.env.LEMONSQUEEZY_EXECUTIVE_VARIANT_YEARLY || null,
  },
];

async function seedPlans() {
  console.log("Seeding plans...");

  const { data: existingPlans, error: fetchError } = await supabase
    .from("plans")
    .select("slug");

  if (fetchError) {
    console.error("Error fetching existing plans:", fetchError);
    process.exit(1);
  }

  console.log(
    `Found ${existingPlans?.length || 0} existing plans: ${existingPlans?.map((p) => p.slug).join(", ") || "none"}`
  );

  const { data, error } = await supabase
    .from("plans")
    .upsert(PLANS, { onConflict: "slug" })
    .select();

  if (error) {
    console.error("Error seeding plans:", error);
    process.exit(1);
  }

  console.log(`Successfully seeded ${data?.length || 0} plans!`);

  for (const plan of data || []) {
    console.log(
      `  - ${plan.name} (${plan.slug}): $${plan.price_monthly_cents / 100}/mo`
    );
  }

  const missingVariants = (data || []).filter(
    (p) =>
      p.slug !== "starter" &&
      !(p.lemonsqueezy_variant_id_monthly && p.lemonsqueezy_variant_id_yearly)
  );

  if (missingVariants.length > 0) {
    console.log(
      "\nWarning: The following plans are missing LemonSqueezy variant IDs:"
    );
    for (const plan of missingVariants) {
      console.log(
        `  - ${plan.name}: Set LEMONSQUEEZY_${plan.slug.toUpperCase()}_VARIANT_MONTHLY and _YEARLY`
      );
    }
  }

  process.exit(0);
}

seedPlans().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
