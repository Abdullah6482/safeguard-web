export function createBackupPayload(reports = [], capa = []) {
  return {
    version: '1.0',
    timestamp: new Date().toISOString(),
    reportsCount: reports.length,
    capaCount: capa.length,
    data: { reports, capa },
  };
}

export function validateBackupPayload(payload) {
  if (!payload || !payload.version || !payload.data) return false;
  return Array.isArray(payload.data.reports) && Array.isArray(payload.data.capa);
}
