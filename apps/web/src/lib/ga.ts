/**
 * src/lib/ga.ts
 * TypeScript-modul for Google Analytics (gtag.js).
 * Bytt ut GA-ID med din egen om nødvendig.
 */

export const GA_TRACKING_ID = 'G-VV3WNJLYL9'; // Skriv din egen ID her

/**
 * Funksjon som sender sidevisning til GA
 * @param url Stien for siden (f.eks. window.location.pathname)
 */
export const pageview = (url: string): void => {
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    (window as any).gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

/** 
 * Funksjon som sender en egendefinert hendelse til GA
 * @param action   Handlingens navn (f.eks. 'click_button')
 * @param category Kategori (f.eks. 'knapper')
 * @param label    Etikett/label (f.eks. 'hoved-knapp')
 * @param value    Numerisk verdi, for eksempel antall (f.eks. 1)
 */
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label: string;
  value: number;
}): void => {
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};
