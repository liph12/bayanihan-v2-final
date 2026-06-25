// Domain types matching the bayanihan API response shapes used in this project.
// Fields are optional because the upstream API is loose and components defensively
// check multiple keys (e.g. ev.eventDate || ev.date).

export interface SubDomain {
  name?: string;
  type?: string;
}

export interface BayanihanEvent {
  id?: string | number;
  slug?: string;
  title?: string;
  image?: string;
  eventDate?: string;
  date?: string;
  subDomain?: SubDomain;
  tags?: string[];
  badges?: string[];
  labels?: string[];
  badge?: string;
  trending?: boolean;
  is_trending?: boolean;
  featured?: boolean;
  is_featured?: boolean;
  upcoming?: boolean;
}

export interface Restaurant {
  id?: string | number;
  slug?: string;
  name?: string;
  photo?: string;
  cover?: string;
  image?: string;
  logo?: string;
  city?: string;
  country?: string;
  category?: string;
  address?: string;
  website_url?: string;
  website?: string;
  site?: string;
  url?: string;
  subDomain?: SubDomain;
  subdomain?: SubDomain | string;
}

export type Locale = "en" | "fil";

export interface NewsArticle {
  id?: string | number;
  slug?: string;
  title?: string;
  description?: string;
  summary?: string | string[];
  content?: string;
  body?: string;
  excerpt?: string;
  date?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  image_url?: string | null;
  image?: string | null;
  category?: string;
  country?: string;
  author?: string;
  status?: string;
  tags?: string | string[];
  views_count?: number;
  views?: number;
  likes_count?: number;
  likes?: number;
  original_url?: string;
}

export interface NewsPage {
  items: NewsArticle[];
  page: number;
  lastPage: number;
  error?: string | null;
}

export interface ConsulateOffice {
  id?: string | number;
  country: string;
  office_name: string;
  office_logo?: string | null;
  address?: string | null;
  email?: string | null;
  contact_number?: string | null;
  website?: string | null;
  facebook_link?: string | null;
  photos?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ConsulateDirectory {
  items: ConsulateOffice[];
  error?: string | null;
}

export interface Country {
  code: string;
  name: string;
}

export interface UserData {
  email?: string;
  role_id?: number;
  [key: string]: unknown;
}
