export function IsChromeExtension(): boolean {
  return typeof chrome !== 'undefined' && !!chrome.runtime?.id;
}
