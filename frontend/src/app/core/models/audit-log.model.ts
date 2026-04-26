export interface AuditLog {
  id: string;
  action: string;
  details: string;
  performedBy: string;
  entityId: string;
  timestamp: string;
}
