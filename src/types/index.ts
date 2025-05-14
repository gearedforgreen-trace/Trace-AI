export interface IStore {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  status: "active" | "inactive";
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  lat: number;
  lng: number;
  organizationId?: string;
}
