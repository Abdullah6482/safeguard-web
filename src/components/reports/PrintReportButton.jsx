import React from 'react';
import { Printer } from 'lucide-react';
import Button from '../common/Button';

export default function PrintReportButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Button variant="outline" size="sm" onClick={handlePrint}>
      <Printer className="h-4 w-4 mr-1.5" />
      Print Summary
    </Button>
  );
}
