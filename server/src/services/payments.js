// Payment provider abstraction. No provider is faked: if none is configured,
// online payment initialisation returns a clear 503 so nothing pretends to be paid.
import { env } from '../config/env.js';
export const providers = {
  // sslcommerz: { init: async (order) => ..., verify: async (payload) => ... }
  // Add a real sandbox integration here once you have merchant credentials.
};
export function getProvider() {
  const p = providers[env.paymentProvider];
  if (!p) { const e = new Error('Online payment is not configured on this server yet'); e.status = 503; throw e; }
  return p;
}
