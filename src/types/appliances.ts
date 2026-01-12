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
}

export interface RepairPart {
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
