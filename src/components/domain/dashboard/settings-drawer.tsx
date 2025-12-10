import Button from "@/components/Button";
import { Settings } from "lucide-react";

export function DashboardSettings() {
  return (
    <Button variant="outline" size="sm">
      <Settings className="mr-2 h-4 w-4" />
      Configurar
    </Button>
  );
}
