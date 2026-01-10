"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card } from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { roles as rolesApi } from "@/services/api";
import { 
  Shield, 
  ArrowLeft, 
  Save,
  CheckSquare,
  Square,
  Search,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function EditRolePage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_custom: true
  });

  useEffect(() => {
    if (roleId) {
      loadData();
    }
  }, [roleId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [roleData, allPermissions] = await Promise.all([
        rolesApi.get(roleId),
        rolesApi.listPermissions()
      ]);

      setFormData({
        name: roleData.name,
        description: roleData.description || "",
        is_custom: roleData.is_custom
      });
      setSelectedPermissions(roleData.permissions.map((p: any) => p.id));
      setPermissions(allPermissions);
    } catch (error) {
      console.error("Error loading role data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPermissions.length === 0) {
      alert("Debes seleccionar al menos un permiso");
      return;
    }

    setSaving(true);
    try {
      await rolesApi.update(roleId, {
        ...formData,
        permission_ids: selectedPermissions
      });
      router.push("/roles");
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Error al actualizar el rol");
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (id: string) => {
    if (!formData.is_custom) return; // Cannot edit system roles permissions here for now
    setSelectedPermissions(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id) 
        : [...prev, id]
    );
  };

  const categories = Array.from(new Set(permissions.map(p => p.category)));

  const filteredPermissions = permissions.filter(p => 
    p.permission_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="w-full h-64 flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="w-full pb-20">
      <div className="mb-10">
        <Link href="/roles" className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-4">
          <ArrowLeft size={20} />
          Volver a Roles
        </Link>
        <h1 className="text-4xl font-bold text-primary mb-2">Editar Rol</h1>
        <p className="text-lg text-gray-600">
          Modifica los permisos y detalles del rol {formData.name}.
        </p>
      </div>

      {!formData.is_custom && (
        <div className="mb-8 bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 items-center text-amber-800">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">
            Este es un rol de sistema. Solo puedes editar su nombre y descripción, pero no sus permisos base.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="w-full max-w-none p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Input
                label="Nombre del Rol"
                placeholder="Ej: Supervisor de Turno"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                icon={<Shield size={18} />}
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[120px]"
                  placeholder="Describe las responsabilidades de este rol..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <div className="bg-[var(--color-light)] rounded-xl p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckSquare size={20} className="text-primary" />
                Resumen de Selección
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Permisos asignados:</span>
                  <span className="font-bold text-primary">{selectedPermissions.length}</span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <Button 
                    type="submit" 
                    className="w-full flex items-center justify-center gap-2"
                    disabled={saving}
                  >
                    <Save size={20} />
                    {saving ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-800">Permisos del Rol</h2>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar permisos..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(category => {
              const catPermissions = filteredPermissions.filter(p => p.category === category);
              if (catPermissions.length === 0) return null;

              return (
                <Card key={category} className="overflow-hidden">
                  <div className="bg-[var(--color-light)] px-4 py-3 border-b border-gray-100">
                    <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider">
                      {category || "General"}
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {catPermissions.map(permission => (
                      <div 
                        key={permission.id}
                        className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
                          selectedPermissions.includes(permission.id) 
                            ? "bg-primary/5 border border-primary/10" 
                            : "border border-transparent"
                        } ${formData.is_custom ? "cursor-pointer hover:bg-[var(--color-light)]" : "opacity-75"}`}
                        onClick={() => togglePermission(permission.id)}
                      >
                        <div className="mt-0.5">
                          {selectedPermissions.includes(permission.id) 
                            ? <CheckSquare size={18} className="text-primary" />
                            : <Square size={18} className="text-gray-300" />
                          }
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{permission.permission_key}</p>
                          <p className="text-xs text-gray-500 leading-relaxed">{permission.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </form>
    </div>
  );
}
