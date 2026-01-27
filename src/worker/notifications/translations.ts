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
  ar: {
    subject: "تنبيه انخفاض المخزون: {itemName}",
    title: "تنبيه انخفاض المخزون",
    body: 'المنتج "{itemName}" وصل إلى {currentStock} وحدة.',
    emailTitle: "تنبيه انخفاض المخزون",
    emailIntro:
      "المنتج التالي انخفض عن الحد المسموح به <strong>{threshold}</strong>:",
    emailItem: "المنتج:",
    emailStock: "المخزون الحالي:",
    emailFooter: "يرجى تسجيل الدخول إلى لوحة التحكم لإعادة التعبئة.",
  },
};

export function getTranslation(
  lang: string,
  key: string,
  params: Record<string, string> = {}
): string {
  const langUpper = lang.toLowerCase();
  const t = translations[langUpper] || translations.en;
  let text = t[key] || translations.en[key] || key;

  for (const [param, value] of Object.entries(params)) {
    text = text.replace(new RegExp(`{${param}}`, "g"), value);
  }

  return text;
}
