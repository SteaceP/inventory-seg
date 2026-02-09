import { beforeEach, describe, expect, it, vi } from "vitest";

import { render, waitFor } from "@test/test-utils";

import SEO from "../SEO";

// Mock useTranslation
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "app.title": "Inventaire SEG",
        "seo.description.default":
          "Système avancé de gestion d'inventaire avec suivi multi-emplacements, réapprovisionnement piloté par IA et historique de maintenance des appareils.",
        "seo.description.dashboard":
          "Consultez l'aperçu de l'inventaire, les alertes de stock faible et l'activité récente",
      };
      return translations[key] || key;
    },
  }),
}));

describe("SEO Component", () => {
  beforeEach(() => {
    // Reset document head before each test
    document.title = "";
    const metas = document.querySelectorAll("meta");
    metas.forEach((meta) => meta.remove());
  });

  it("should set default title and description", async () => {
    render(<SEO />);

    await waitFor(() => {
      expect(document.title).toBe("Inventaire SEG");
      const descriptionMeta = document.querySelector(
        'meta[name="description"]'
      );
      expect(descriptionMeta?.getAttribute("content")).toBe(
        "Système avancé de gestion d'inventaire avec suivi multi-emplacements, réapprovisionnement piloté par IA et historique de maintenance des appareils."
      );
    });
  });

  it("should set custom title and description", async () => {
    render(
      <SEO title="Dashboard" descriptionKey="seo.description.dashboard" />
    );

    await waitFor(() => {
      expect(document.title).toBe("Dashboard | Inventaire SEG");
      const descriptionMeta = document.querySelector(
        'meta[name="description"]'
      );
      expect(descriptionMeta?.getAttribute("content")).toBe(
        "Consultez l'aperçu de l'inventaire, les alertes de stock faible et l'activité récente"
      );
    });
  });

  it("should set noIndex meta tag when prop is true", async () => {
    render(<SEO noIndex={true} />);

    await waitFor(() => {
      const robotsMeta = document.querySelector('meta[name="robots"]');
      expect(robotsMeta?.getAttribute("content")).toBe("noindex, nofollow");
    });
  });

  it("should not set noIndex meta tag when prop is false", async () => {
    render(<SEO noIndex={false} />);

    await waitFor(() => {
      const robotsMeta = document.querySelector('meta[name="robots"]');
      expect(robotsMeta).toBeNull();
    });
  });

  it("should set canonical URL", async () => {
    const customUrl = "https://example.com/custom";
    render(<SEO canonicalUrl={customUrl} />);

    await waitFor(() => {
      const canonicalLink = document.querySelector('link[rel="canonical"]');
      expect(canonicalLink?.getAttribute("href")).toBe(customUrl);

      const ogUrl = document.querySelector('meta[property="og:url"]');
      expect(ogUrl?.getAttribute("content")).toBe(customUrl);
    });
  });
});
