export const notFound = (req, res) => res.status(404).json({ success: false, message: 'Not found' });
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  const status = err.status || (['CastError', 'ValidationError'].includes(err.name) ? 400 : 500);
  if (status >= 500) console.error(err);
  res.status(status).json({ success: false, message: status >= 500 ? 'Something went wrong' : err.message });
}
export const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
