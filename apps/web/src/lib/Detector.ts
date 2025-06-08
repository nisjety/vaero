/**
 * src/lib/Detector.ts
 * Omskriver opprinnelig detector.js til TypeScript-modul.
 * Sjekker om WebGL er tilgjengelig i nettleseren, og viser feilmelding
 * dersom ikke.
 */

export class Detector {
  /** Sjekker om nettleseren støtter CanvasRenderingContext2D */
  public static canvas(): boolean {
    return typeof window !== 'undefined' && !!(window as Window & { CanvasRenderingContext2D?: unknown }).CanvasRenderingContext2D;
  }

  /** Sjekker om nettleseren støtter WebGL */
  public static webgl(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
    } catch {
      return false;
    }
  }

  /** Returnerer en <div> med norsk feilmelding hvis WebGL ikke fungerer */
  public static getWebGLErrorMessage(): HTMLDivElement {
    const element = document.createElement('div');
    element.style.fontFamily = 'monospace';
    element.style.fontSize = '13px';
    element.style.textAlign = 'center';
    element.style.background = '#eee';
    element.style.color = '#000';
    element.style.padding = '1em';
    element.style.width = '475px';
    element.style.margin = '5em auto 0';

    if (!Detector.webgl()) {
      element.innerHTML = window.WebGLRenderingContext
        ? 'Beklager, maskinvaren din støtter ikke WebGL.'
        : 'Beklager, nettleseren din støtter ikke WebGL. <br/>'
          + 'Vennligst prøv med en nyeste versjon av Chrome, Firefox eller Safari.';
    }

    return element;
  }

  /**
   * Legger til feilmeldingen under parent-elementet (default: document.body)
   * @param parent HTML-element å feste feilmeldingen til
   * @param id      id-verdi på <div> med feilmeldingen
   */
  public static addGetWebGLMessage(parent: HTMLElement = document.body, id: string = 'oldie'): void {
    const errorMessage = Detector.getWebGLErrorMessage();
    errorMessage.id = id;
    parent.appendChild(errorMessage);
  }
}
