export type Person = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  initials: string;
  avgRating?: number | null;
  totalDeals?: number;
  totalRatings?: number;
};
