import AuditLog from '../models/AuditLog.js';
export const audit = (req, action, entity, entityId, meta) =>
  AuditLog.create({ actor: req.user?._id, action, entity, entityId: String(entityId), meta }).catch(() => {});
