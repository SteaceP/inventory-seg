export type ApplianceStatus = "functional" | "needs_service" | "broken";

export interface Appliance {
  id: string;
  name: string;
  type: string;
  brand: string;
  model: string;
  serial_number: string;
  purchase_date: string;
  warranty_expiry: string;
  notes: string;
  photo_url?: string;
  sku?: string;
  location?: string;
  status: ApplianceStatus;
  expected_life: number;
  created_at?: string;
}

export interface RepairPart {
  id?: string;
  name: string;
  price: number;
}

export interface Repair {
  id: string;
  repair_date: string;
  description: string;
  cost?: number; // Legacy labor cost (optional)
  parts?: RepairPart[];
  service_provider: string;
}
