export const translations: Record<string, Record<string, string>> = {
  en: {
    subject: "Low Stock Alert: {itemName}",
    title: "Low Stock Alert",
    body: 'The item "{itemName}" is at {currentStock} units.',
    emailTitle: "Low Stock Alert",
    emailIntro:
      "The following item has fallen below your threshold of <strong>{threshold}</strong>:",
    emailItem: "Item:",
    emailStock: "Current Stock:",
    emailFooter: "Please log in to your inventory dashboard to restock.",
  },
  fr: {
    subject: "Alerte Stock Faible: {itemName}",
    title: "Alerte Stock Faible",
    body: 'L\'article "{itemName}" est à {currentStock} unités.',
    emailTitle: "Alerte Stock Faible",
    emailIntro:
      "L'article suivant est tombé en dessous de votre seuil de <strong>{threshold}</strong> :",
    emailItem: "Article :",
    emailStock: "Stock Actuel :",
    emailFooter:
      "Veuillez vous connecter à votre tableau de bord d'inventaire pour vous réapprovisionner.",
  },
};

export function getTranslation(
  lang: string,
  key: string,
  params: Record<string, string> = {}
): string {
  const langLower = lang.toLowerCase();
  const t = translations[langLower] || translations.en;
  let text = t[key] || translations.en[key] || key;

  for (const [param, value] of Object.entries(params)) {
    text = text.replace(new RegExp(`{${param}}`, "g"), value);
  }

  return text;
}
