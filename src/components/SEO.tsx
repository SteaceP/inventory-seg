import { Helmet } from "@dr.pogodin/react-helmet";

import { useTranslation } from "../i18n";

interface SEOProps {
  /**
   * Page-specific title suffix (e.g., "Dashboard", "Inventory")
   * Will be combined with app title to form: "Dashboard | SEG Inventory" or "Tableau de bord | Inventaire SEG"
   */
  title?: string;
  /**
   * Translation key for the page description (e.g., "seo.description.dashboard")
   */
  descriptionKey?: string;
  /**
   * Whether to prevent search engines from indexing this page
   */
  noIndex?: boolean;
  /**
   * Custom canonical URL (defaults to current URL)
   */
  canonicalUrl?: string;
}

export default function SEO({
  title,
  descriptionKey = "seo.description.default",
  noIndex = false,
  canonicalUrl,
}: SEOProps) {
  const { t } = useTranslation();

  const appTitle = t("app.title");
  const fullTitle = title ? `${title} | ${appTitle}` : appTitle;
  const description = t(descriptionKey);
  const canonical = canonicalUrl || window.location.href;
  const ogImage = `${window.location.origin}/icons/icon.svg`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={appTitle} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary" />
      <meta property="twitter:url" content={canonical} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />

      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />
    </Helmet>
  );
}
