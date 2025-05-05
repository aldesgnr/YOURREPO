export enum CompanyType {
  SP_ZOO = "Sp. z o.o.",
  SA = "S.A.",
  JDG = "JDG",
  OTHER = "Inna"
}

export enum RevenueRange {
  BELOW_200K = "<200 k",
  ABOVE_200K = ">200 k"
}

export interface CompanyProfileBase {
  name: string;
  nip: string;
  vat_id?: string;
  industry?: string;
  company_type?: CompanyType;
  pkd_code?: string;
  
  // Tax specific fields
  cit_rate_reduced?: boolean;
  estonian_cit?: boolean;
  revenue_range?: RevenueRange;
  related_party_transactions?: boolean;
  rd_relief?: boolean;
  
  // Financial data
  employee_count?: number;
  annual_revenue?: number;
}

export interface CompanyProfile extends CompanyProfileBase {
  id: number;
  user_id: number;
  created_at: string;
}

export type CompanyProfileCreate = CompanyProfileBase;

export type CompanyProfileUpdate = Partial<CompanyProfileBase>;
