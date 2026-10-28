import { useSettings } from '../hooks/queries.js';
const Page = ({ title, children }) => <div className="container-x max-w-3xl py-16"><h1 className="text-5xl text-forest">{title}</h1><div className="mt-6 space-y-4 leading-relaxed text-charcoal/80">{children}</div></div>;
export const About = () => <Page title="Our story"><p>Verdant Table began as a small kitchen with a simple idea: cook honest food with ingredients we trust, and serve it with warmth.</p><p>Today our chefs combine Bangladeshi heritage recipes with modern technique, and every dish — whether enjoyed in our dining room, picked up, or delivered — is prepared fresh to order.</p></Page>;
export function Contact() { const { data: s } = useSettings(); return <Page title="Contact us"><p><b>Address:</b> {s?.address}</p><p><b>Phone:</b> {s?.phone}</p><p><b>Email:</b> {s?.email}</p><p><b>Hours:</b> {s?.openingHours}</p></Page>; }
export function Delivery() { const { data: s } = useSettings(); return <Page title="Delivery & pickup"><p>We deliver across central Dhaka. A delivery fee of ৳{(s?.deliveryFee || 0) / 100} applies to orders under ৳{(s?.freeDeliveryOver || 0) / 100}. The minimum order is ৳{(s?.minOrder || 0) / 100}.</p><p><b>Pickup:</b> {s?.pickupInstructions}</p><p>Cash on delivery is accepted. Online payment will be offered once our payment partner is live.</p></Page>; }
export const Privacy = () => <Page title="Privacy policy"><p>We collect only what we need to fulfil your order: your name, phone, email and delivery address. We never store card details. We do not sell your data. Contact us to request deletion of your account.</p><p className="text-sm italic">Replace this placeholder with a policy reviewed for your business.</p></Page>;
export const Terms = () => <Page title="Terms & conditions"><p>Prices include applicable VAT as shown at checkout. Orders may be cancelled before the restaurant confirms them. Delivery times are estimates.</p><p className="text-sm italic">Replace this placeholder with terms reviewed for your business.</p></Page>;
export const Cookies = () => <Page title="Cookie policy">
  <p>Cookies are small text files stored by your browser. We keep them to a minimum.</p>
  <h2 className="pt-4 text-2xl text-forest">Essential cookies (always on)</h2>
  <ul className="list-disc space-y-1 pl-6">
    <li><b>vt_session</b> — keeps you logged in (7 days).</li>
    <li><b>vt_guest_orders</b> — lets guests view their own orders without an account (30 days).</li>
    <li><b>vt_consent</b> — remembers your cookie choice (180 days).</li>
    <li><b>vt-cart</b> — your cart, kept in your browser's local storage.</li>
  </ul>
  <h2 className="pt-4 text-2xl text-forest">Optional cookies</h2>
  <p><b>Analytics</b> and <b>marketing</b> cookies are only used if you allow them. We don't use any yet; if we add them, they will stay off until you agree.</p>
  <p>You can change your choice at any time with <b>Cookie settings</b> in the footer.</p>
  <p className="text-sm italic">Replace this placeholder with a policy reviewed for your business.</p>
</Page>;
export const NotFound = () => <Page title="Page not found"><p>The page you are looking for doesn't exist.</p></Page>;
