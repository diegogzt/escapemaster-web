import { MoreHorizontal, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { WidgetConfigOptions } from "../types";
import { users as usersApi } from "@/services/api";

interface TeamMember {
  id: string | number;
  name: string;
  role: string;
  status: string;
  avatar: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

export function TeamStatus({}: WidgetConfigOptions) {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeam() {
      try {
        setLoading(true);
        const data = await usersApi.list({ limit: 20 });
        const usersList = Array.isArray(data) ? data : data.users || data.items || [];
        const mapped: TeamMember[] = usersList.map((u: any) => ({
          id: u.id,
          name: u.full_name || u.name || u.email || "Usuario",
          role: u.role_name || (typeof u.role === "object" ? u.role?.name : u.role) || "Staff",
          status: u.is_active === false ? "offline" : "online",
          avatar: getInitials(u.full_name || u.name || u.email || "U"),
        }));
        setTeam(mapped);
      } catch (err) {
        console.error("Error fetching team:", err);
        setTeam([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTeam();
  }, []);

  return (
    <div className="bg-[var(--color-background)] rounded-xl border border-[var(--color-beige)] shadow-sm h-full">
      <div className="p-6 border-b border-[var(--color-beige)] flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-foreground)]">Equipo</h3>
          <p className="text-sm text-[var(--color-muted-foreground)]">Estado del personal</p>
        </div>
        <button
          className="text-[var(--color-muted-foreground)] hover:text-[var(--color-muted-foreground)]"
          aria-label="Opciones"
          title="Opciones"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-[var(--color-muted-foreground)]" />
          </div>
        ) : team.length === 0 ? (
          <p className="text-sm text-[var(--color-muted-foreground)] text-center py-8">No hay miembros del equipo</p>
        ) : (
        <div className="space-y-4">
          {team.map((member) => (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-light)] flex items-center justify-center text-sm font-bold text-[var(--color-muted-foreground)]">
                    {member.avatar}
                  </div>
                  <div
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      member.status === "online"
                        ? "bg-green-500"
                        : member.status === "busy"
                        ? "bg-red-500"
                        : "bg-gray-400"
                    }`}
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[var(--color-foreground)]">
                    {member.name}
                  </h4>
                  <p className="text-xs text-[var(--color-muted-foreground)]">{member.role}</p>
                </div>
              </div>
              <span className="text-xs text-[var(--color-muted-foreground)] capitalize">
                {member.status}
              </span>
            </div>
          ))}
        </div>
        )}
        <button className="w-full mt-6 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors border border-dashed border-[var(--color-beige)] rounded-lg hover:bg-[var(--color-light)]">
          Gestionar equipo
        </button>
      </div>
    </div>
  );
}
