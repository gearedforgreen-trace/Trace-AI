"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
  onClick?: () => void;
  clickable?: boolean;
}

export function QRCodeComponent({ 
  value, 
  size = 128, 
  className, 
  onClick, 
  clickable = false 
}: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateQR = async () => {
      if (!canvasRef.current || !value) return;

      try {
        setError(null);
        await QRCode.toCanvas(canvasRef.current, value, {
          width: size,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
      } catch (err) {
        setError("Failed to generate QR code");
        console.error("QR Code generation error:", err);
      }
    };

    generateQR();
  }, [value, size]);

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 border border-gray-200 ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-xs text-gray-500">QR Error</span>
      </div>
    );
  }

  const containerClassName = clickable 
    ? `cursor-pointer hover:opacity-80 transition-opacity ${className || ''}` 
    : className;

  return (
    <canvas
      ref={canvasRef}
      className={containerClassName}
      style={{ width: size, height: size }}
      onClick={clickable ? onClick : undefined}
      title={clickable ? "Click to view larger QR code" : undefined}
    />
  );
}