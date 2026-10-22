export type DesignCategory =
  | "shopping_mall"
  | "homepage"
  | "ai_mvp"
  | "maintenance";

export type LineItemId =
  | "shopping_cafe24"
  | "shop_scope_planning"
  | "shop_scope_premium"
  | "shop_status_renewal"
  | "shop_status_migration"
  | "shop_feat_coupon"
  | "shop_feat_subscription"
  | "shop_feat_wholesale"
  | "shop_feat_reservation"
  | "shop_feat_review"
  | "shop_feat_sns"
  | "homepage_wordpress"
  | "homepage_landing"
  | "homepage_landing_section"
  | "homepage_page_1"
  | "homepage_page_2_3"
  | "homepage_page_4_7"
  | "homepage_page_8plus"
  | "homepage_scope_planning"
  | "homepage_lang_1"
  | "homepage_lang_2"
  | "homepage_lang_3"
  | "ai_pipeline"
  | "ai_mvp_basic"
  | "maintenance_monthly"
  | "maintenance_feature"
  | "maintenance_ai_claude_pro"
  | "maintenance_ai_claude_max"
  | "maintenance_ai_codex_go"
  | "maintenance_ai_codex_plus"
  | "maintenance_ai_codex_pro";

export interface LineItemOption {
  id: LineItemId;
  label: string;
  description: string;
  basePrice: number;
  copywritingPrice: number;
  hasQuantity: boolean;
  quantityUnit: string;
  category: DesignCategory;
}

export interface SelectedLineItem {
  id: LineItemId;
  quantity: number;
  withCopywriting: boolean;
}

export type ShopIndustry =
  | "fashion"
  | "food"
  | "beauty"
  | "living"
  | "digital"
  | "etc";

export type ShopStatus = "new" | "renewal" | "migration";

export type ProductionScope = "basic" | "planning_copy" | "premium";

export type RequiredFeature =
  | "coupon_point"
  | "subscription"
  | "wholesale"
  | "reservation"
  | "review"
  | "sns_login";

export type Schedule = "within_2weeks" | "within_1month" | "flexible";

export type StylePreference = "minimal" | "modern" | "impact" | "cute" | "premium";

export type TargetAge = "10s_20s" | "30s_40s" | "50s_plus" | "all_ages";

export interface ContactInfo {
  name: string;
  contact: string;
  email: string;
  businessNumber: string;
  projectSummary: string;
  referenceUrls: [string, string, string];
}

export interface QuoteWizardState {
  currentStep: 1 | 2 | 3 | 4 | 5;
  selectedCategories: DesignCategory[];
  selectedItems: SelectedLineItem[];
  shopIndustry: ShopIndustry | null;
  shopStatus: ShopStatus | null;
  productionScope: ProductionScope | null;
  needsSystemDev: boolean;
  requiredFeatures: RequiredFeature[];
  schedule: Schedule | null;
  stylePreferences: StylePreference[];
  targetAge: TargetAge | null;
  contactInfo: ContactInfo;
  estimatedTotal: number;
  submissionId: string | null;
}

export interface QuoteLineBreakdown {
  itemId: LineItemId;
  label: string;
  quantity: number;
  unitPrice: number;
  copywritingSubtotal: number;
  subtotal: number;
}

export interface QuoteCalculationResult {
  lines: QuoteLineBreakdown[];
  total: number;
}

export interface QuoteSubmissionRow {
  id: string;
  selected_categories: DesignCategory[];
  selected_items: SelectedLineItem[];
  schedule: Schedule | null;
  style_preferences: StylePreference[];
  target_age: TargetAge | null;
  contact_name: string;
  contact_value: string;
  contact_email: string | null;
  business_number: string | null;
  project_summary: string | null;
  reference_urls: string[];
  estimated_total: number;
  shop_industry: ShopIndustry | null;
  shop_status: ShopStatus | null;
  production_scope: ProductionScope | null;
  required_features: RequiredFeature[];
  needs_system_dev: boolean;
  ip_address: string | null;
  user_agent: string | null;
  referer: string | null;
  is_authenticated: boolean;
  utm_params: Record<string, string>;
  created_at: string;
}
