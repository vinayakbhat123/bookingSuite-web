export interface CuratedRegion {
  id: string;
  city: string;
  title: string;
  subtitle: string;
  image: string;
  avgPrice: string; // e.g. "₹3,800" or "3800"
  displayOrder: number;
  isActive: boolean;
  tag?: string; // e.g. "Beach Haven", "Royal Heritage", "Hill Station"
}
