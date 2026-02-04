import type { RenderOptions } from "@testing-library/react";

export interface CustomRenderOptions extends RenderOptions {
  includeRouter?: boolean;
  includeAlerts?: boolean;
}

export interface MockSupabaseResponse<T> {
  data: T | null;
  error: { message: string } | null;
}
