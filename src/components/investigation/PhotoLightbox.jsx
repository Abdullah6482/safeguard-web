import React, { useState } from 'react';
import { RotateCw, ZoomIn, X } from 'lucide-react';

export default function PhotoLightbox({ imageUrl, isOpen, onClose }) {
  const [rotation, setRotation] = useState(0);

  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="relative max-w-4xl max-h-[90vh]">
        <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
          <button
            onClick={() => setRotation(r => (r + 90) % 360)}
            className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors"
          >
            <RotateCw className="h-5 w-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <img
          src={imageUrl}
          alt="Evidence preview"
          style={{ transform: `rotate(${rotation}deg)` }}
          className="max-h-[85vh] max-w-full rounded-lg object-contain transition-transform"
        />
      </div>
    </div>
  );
}
