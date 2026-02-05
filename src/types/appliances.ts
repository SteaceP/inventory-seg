import type { Database } from "./database.types";

/**
 * Possible maintenance statuses for a household appliance.
 */
export type ApplianceStatus = Database["public"]["Enums"]["appliance_status"];

/**
 * Represents a complete household appliance record.
 */
export type Appliance = Database["public"]["Tables"]["appliances"]["Row"];

/**
 * Represents a specific part used or needed for an appliance repair.
 */
export interface RepairPart {
  /** Optional identifier for the part */
  id?: string;
  /** Name or description of the part */
  name: string;
  /** Cost of the part in CAD */
  price: number;
}

/**
 * Represents an appliance repair record with its associated parts.
 */
export type Repair = Omit<
  Database["public"]["Tables"]["repairs"]["Row"],
  "parts"
> & {
  /** Detailed list of parts used in the repair */
  parts: RepairPart[] | null;
};
