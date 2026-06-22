export function buildPdfMetadata(report) {
  return {
    title: `Incident-Report-${report.id || 'Draft'}`,
    author: 'SafeGuard HSE Portal',
    subject: report.title || 'Safety Incident',
    generatedAt: new Date().toISOString(),
  };
}
