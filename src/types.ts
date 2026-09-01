/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'client' | 'admin';

export interface Profile {
  id: string;
  email?: string;
  full_name: string;
  phone: string;
  address: string;
  avatar_url: string;
  role: UserRole;
  created_at: string;
}

export type LoanStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'signed' | 'disbursed';

export interface LoanType {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  min_amount: number;
  max_amount: number;
  min_duration_months: number;
  max_duration_months: number;
  interest_rate: number; // e.g. 5.99 for 5.99%
  is_active: boolean;
  created_at: string;
  image_url?: string;
}

export interface DocumentUpload {
  name: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface LoanRequest {
  id: string;
  user_id: string;
  loan_type_id: string;
  amount_requested: number;
  duration_months: number;
  status: LoanStatus;
  purpose: string;
  monthly_income: number;
  documents: DocumentUpload[];
  admin_note?: string;
  created_at: string;
  updated_at: string;
}

export interface BankAccount {
  id: string;
  user_id: string;
  account_holder: string;
  iban: string;
  bank_name: string;
  country?: string;
  is_verified: boolean;
  created_at: string;
}

export type TransactionType = 'disbursement' | 'withdrawal' | 'repayment';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface Transaction {
  id: string;
  user_id: string;
  loan_request_id?: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  bank_details?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  type: string;
  created_at: string;
  is_popup?: boolean;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_from_admin: boolean;
  is_read: boolean;
  created_at: string;
}

export interface Contract {
  id: string;
  loan_request_id: string;
  file_url: string;
  signed_at?: string;
  created_at: string;
  content?: string;
  attachments?: string[];
  status: 'draft' | 'sent';
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  author_id?: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
}

export type ShowcaseStatus = 'approved' | 'disbursed';

export interface ApprovedClientShowcase {
  id: string;
  user_id: string;
  display_name: string;
  loan_type: string;
  amount_range: string;
  testimonial: string;
  photo_url: string;
  status: ShowcaseStatus;
  is_public: boolean;
  created_at: string;
}

export type ConsultationLeadStatus = 'new' | 'contacted' | 'converted' | 'archived';

export interface ConsultationLead {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  loan_type: string;
  status: ConsultationLeadStatus;
  notes?: string;
  created_at: string;
}
