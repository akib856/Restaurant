import { create } from 'zustand';
// Cookie consent, stored in the 'vt_consent' cookie for 180 days.
// Essential cookies (login session, guest orders, cart) are always on; only optional categories need consent.
// Before adding analytics/marketing scripts, gate them with: useConsent.getState().choice?.analytics
const NAME = 'vt_consent';
const VERSION = 1; // bump to ask everyone again after the cookie policy changes
function read() {
  try {
    const raw = document.cookie.split('; ').find((c) => c.startsWith(NAME + '='));
    const v = raw && JSON.parse(decodeURIComponent(raw.slice(NAME.length + 1)));
    return v?.v === VERSION ? v : null;
  } catch { return null; }
}
function write(choice) {
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${NAME}=${encodeURIComponent(JSON.stringify(choice))}; Max-Age=${180 * 86400}; Path=/; SameSite=Lax${secure}`;
}
export const useConsent = create((set) => ({
  choice: read(),          // null = not decided yet → banner shows
  panelOpen: false,
  save: (analytics, marketing) => {
    const choice = { v: VERSION, analytics, marketing, at: new Date().toISOString() };
    write(choice); set({ choice, panelOpen: false });
  },
  openPanel: () => set({ panelOpen: true }),
  closePanel: () => set({ panelOpen: false }),
}));
