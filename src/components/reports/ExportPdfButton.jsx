import React, { useState } from 'react';
import { Download } from 'lucide-react';
import Button from '../common/Button';

export default function ExportPdfButton({ onExport }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      if (onExport) await onExport();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleClick} loading={loading}>
      <Download className="h-4 w-4 mr-1.5" />
      Download PDF
    </Button>
  );
}
