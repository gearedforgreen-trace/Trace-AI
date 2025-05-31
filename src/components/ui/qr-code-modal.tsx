"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { toast } from "sonner";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  title?: string;
  binNumber?: string;
}

export function QRCodeModal({ 
  isOpen, 
  onClose, 
  value, 
  title = "QR Code", 
  binNumber 
}: QRCodeModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);

  const generateQR = useCallback(async (canvas: HTMLCanvasElement) => {
    if (!canvas || !value) {
      console.log("QR Generation skipped:", { canvas: !!canvas, value });
      return;
    }

    try {
      setError(null);
      setIsGenerating(true);
      setQrGenerated(false);
      
      console.log("Generating QR code for value:", value);
      
      // Set canvas dimensions explicitly
      canvas.width = 400;
      canvas.height = 400;
      
      await QRCode.toCanvas(canvas, value, {
        width: 400,
        margin: 4,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      });
      
      console.log("QR code generated successfully");
      setQrGenerated(true);
    } catch (err) {
      setError("Failed to generate QR code");
      console.error("QR Code generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  }, [value]);

  const canvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
    setCanvasElement(canvas);
    if (canvas && isOpen && value && !qrGenerated) {
      // Use requestAnimationFrame to ensure the canvas is fully mounted
      requestAnimationFrame(() => {
        generateQR(canvas);
      });
    }
  }, [isOpen, value, qrGenerated, generateQR]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setQrGenerated(false);
      setError(null);
      setIsGenerating(false);
    }
  }, [isOpen]);

  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null);

  const handleDownload = () => {
    if (!canvasElement || !qrGenerated) {
      toast.error("QR code not ready for download");
      return;
    }

    try {
      canvasElement.toBlob((blob) => {
        if (!blob) {
          toast.error("Failed to generate download");
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `qr-code-bin-${binNumber || 'unknown'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success("QR code downloaded successfully");
      }, "image/png");
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download QR code");
    }
  };

  const handlePrint = () => {
    if (!canvasElement || !qrGenerated) {
      toast.error("QR code not ready for printing");
      return;
    }

    try {
      const dataUrl = canvasElement.toDataURL("image/png");
      
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Failed to open print window");
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR Code - Bin ${binNumber || 'Unknown'}</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                font-family: Arial, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
              }
              .qr-container {
                text-align: center;
                page-break-inside: avoid;
              }
              .qr-title {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 20px;
                color: #333;
              }
              .qr-image {
                border: 2px solid #ddd;
                border-radius: 8px;
                margin-bottom: 20px;
              }
              .qr-url {
                font-size: 14px;
                color: #666;
                word-break: break-all;
                max-width: 400px;
              }
              @media print {
                body { margin: 0; }
                .qr-container { margin: 0; }
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="qr-title">Bin ${binNumber || 'Unknown'} - QR Code</div>
              <img src="${dataUrl}" alt="QR Code" class="qr-image" />
              <div class="qr-url">${value}</div>
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
      
      toast.success("Opening print dialog");
    } catch (err) {
      console.error("Print error:", err);
      toast.error("Failed to print QR code");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex justify-center">
            {isGenerating && (
              <div className="flex items-center justify-center w-[400px] h-[400px] bg-gray-50 border border-gray-200 rounded-lg">
                <div className="text-sm ">Generating QR code...</div>
              </div>
            )}
            
            {error && (
              <div className="flex items-center justify-center w-[400px] h-[400px] bg-gray-50 border border-gray-200 rounded-lg">
                <div className="text-sm text-red-500">{error}</div>
              </div>
            )}
            
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              className={`border border-gray-200 rounded-lg ${isGenerating || error ? 'hidden' : ''}`}
              style={{ width: 400, height: 400 }}
            />
          </div>
          
          {binNumber && (
            <div className="text-center">
              <div className="font-medium text-lg">Bin {binNumber}</div>
              <div className="text-sm  break-all mt-1">{value}</div>
            </div>
          )}
          
          <div className="flex justify-center gap-3">
            <Button 
              onClick={handleDownload} 
              variant="outline"
              disabled={isGenerating || !!error || !qrGenerated}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button 
              onClick={handlePrint} 
              variant="outline"
              disabled={isGenerating || !!error || !qrGenerated}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}