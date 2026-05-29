"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/primitives/Button";

export function PrintButton() {
  return (
    <Button
      variant="primary"
      size="sm"
      className="flex items-center gap-2"
      onClick={() => window.print()}
    >
      <Printer size={14} />
      พิมพ์ / บันทึก PDF
    </Button>
  );
}
