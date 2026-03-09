"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

type BarcodeDisplayProps = {
  value: string;
  format?: "UPC" | "EAN13" | "CODE128";
  width?: number;
  height?: number;
};

export function BarcodeDisplay({
  value,
  format = "CODE128",
  width = 2,
  height = 60,
}: BarcodeDisplayProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;

    try {
      JsBarcode(svgRef.current, value, {
        format,
        width,
        height,
        displayValue: true,
        fontSize: 14,
        margin: 10,
        background: "transparent",
        lineColor: "#000",
      });
    } catch {
      // If barcode generation fails (e.g. invalid UPC check digit),
      // fall back to CODE128 which accepts any string
      try {
        JsBarcode(svgRef.current, value, {
          format: "CODE128",
          width,
          height,
          displayValue: true,
          fontSize: 14,
          margin: 10,
          background: "transparent",
          lineColor: "#000",
        });
      } catch {
        // Silently fail if even CODE128 doesn't work
      }
    }
  }, [value, format, width, height]);

  if (!value) return null;

  return (
    <div className="inline-block bg-white rounded-lg border p-2">
      <svg ref={svgRef} />
    </div>
  );
}
