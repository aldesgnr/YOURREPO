export enum TaxCategory {
  VAT = "VAT",
  CIT = "CIT",
  PIT = "PIT",
  TRANSFER_PRICING = "Transfer Pricing",
  TAX_PROCEDURE = "Tax Procedure",
  INTERNATIONAL_TAX = "International Tax",
  OTHER = "Other"
}

export interface NewsBase {
  title: string;
  content: string;
  summary: string;
  category: TaxCategory;
  source_url?: string;
  published_date: string;
}

export interface News extends NewsBase {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface PersonalizedNews {
  news_id: number;
  original_summary: string;
  personalized_summary: string;
}
