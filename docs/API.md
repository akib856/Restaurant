# REST API (`/api/v1`)

All responses: `{ "success": boolean, "data"?: ..., "message"?: string, "meta"?: {...} }`.
Amounts are integers in **poisha** (100 = ৳1). Every POST/PUT/PATCH/DELETE must send header
`X-Requested-With: XMLHttpRequest` (CSRF guard) and `credentials: include` for the session cookie.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /health | – | API + DB status |
| POST | /auth/register | – | `{name,email,password,phone?}` → creates **customer** (role is never accepted), sets cookie |
| POST | /auth/login | – | `{email,password}` → sets httpOnly cookie. Rate-limited 20/15min |
| POST | /auth/logout | – | Clears cookie |
| GET | /auth/me | optional | Current user or `null` |
| PATCH | /auth/me | customer | `{name?,phone?,addresses?[]}` |
| GET | /settings | – | Public restaurant settings |
| GET | /categories | – | Active categories |
| GET | /menu | – | Query: `q, category(slug), available=true, dietary, featured=true, sort=price_asc|price_desc|popular, page, limit` |
| GET | /menu/:slug | – | Dish + `related` |
| POST | /orders/quote | – | `{items:[{menuItemId,quantity,options:[{group,choice}]}], fulfilment, couponCode?}` → server-calculated totals |
| POST | /orders | optional | Quote body + `{idempotencyKey, contact{name,phone,email?}, address? (required for delivery), notes?, paymentMethod: cod|online}`. 201 new, 200 + `duplicate:true` on replay |
| GET | /orders/mine | customer | Own order history |
| GET | /orders/:id | owner/guest cookie/staff | Order details (404 if not yours) |
| POST | /orders/:id/cancel | owner | Only while pending |
| POST | /payments/init/:id | owner | Returns `redirectUrl`; **503 until a provider is configured** |
| POST | /payments/webhook/:provider | provider | Verified server-side by provider module |
| GET | /admin/stats?days=7 | staff | Dashboard. Revenue = sum of `total` for non-cancelled orders with `paymentStatus=paid` |
| GET | /admin/orders | staff | Filters: `status, fulfilment, paymentStatus, q, from, to, page` |
| PATCH | /admin/orders/:id/status | staff | `{status}` – only valid transitions (409 otherwise) |
| POST | /admin/orders/:id/cash-collected | staff | COD only; marks paid, audited |
| GET/POST/PUT | /admin/menu[/:id] | staff read / admin write | Menu CRUD |
| PATCH | /admin/menu/:id/flags | staff (available) / admin (featured, active) | Toggle flags |
| GET/POST/PATCH | /admin/categories[/:id] | admin | Categories |
| GET | /admin/customers, PATCH /admin/customers/:id/status | admin | Customers |
| GET/POST | /admin/coupons | admin | Coupons |
| GET/PUT | /admin/settings | admin | Restaurant settings |
| GET | /admin/audit | admin | Last 100 audit entries |

Example order response (201):
```json
{ "success": true, "duplicate": false, "data": { "orderNumber": "VT-261027-A1B2C3", "subtotal": 90000,
  "deliveryFee": 0, "discount": 0, "tax": 4500, "total": 94500, "status": "pending_confirmation",
  "paymentMethod": "cod", "paymentStatus": "unpaid" } }
```
