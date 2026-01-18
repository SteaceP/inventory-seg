import type { Database } from "./database.types";

export type ApplianceStatus = Database["public"]["Enums"]["appliance_status"];

export type Appliance = Database["public"]["Tables"]["appliances"]["Row"];

export interface RepairPart {
  id?: string;
  name: string;
  price: number;
}

export type Repair = Omit<
  Database["public"]["Tables"]["repairs"]["Row"],
  "parts"
> & {
  parts: RepairPart[] | null;
};
