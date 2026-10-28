export const validate = (schema, where = 'body') => (req, res, next) => {
  const r = schema.safeParse(req[where]);
  if (!r.success) return res.status(400).json({ success: false, message: 'Validation failed', errors: r.error.flatten().fieldErrors });
  req.valid = r.data; next();
};

// Blocks NoSQL operator injection: rejects any request whose body, query or params contain
// a key starting with '$' or containing '.', e.g. ?status[$ne]=x or {"email":{"$gt":""}}.
const hasOperatorKey = (v) => v && typeof v === 'object' && !Buffer.isBuffer(v) &&
  Object.entries(v).some(([k, x]) => k.startsWith('$') || k.includes('.') || hasOperatorKey(x));
export const noOperators = (req, res, next) =>
  [req.body, req.query, req.params].some(hasOperatorKey)
    ? res.status(400).json({ success: false, message: 'Invalid request' })
    : next();
