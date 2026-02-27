"use client";

import { useState, useEffect } from "react";
import { developer } from "@/services/api";
import { PlusCircle, Trash2, Key, Copy, CheckCircle } from "lucide-react";

export default function DevelopersPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [keys, setKeys] = useState<any[]>([]);
  
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");

  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<string | null>(null);

  const [copiedToken, setCopiedToken] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadKeys(selectedProjectId);
      setNewlyCreatedToken(null);
    }
  }, [selectedProjectId]);

  const loadProjects = async () => {
    try {
      const data = await developer.getProjects();
      setProjects(data);
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  const loadKeys = async (projectId: string) => {
    try {
      const data = await developer.getKeys(projectId);
      setKeys(data);
    } catch (error) {
      console.error("Error loading keys:", error);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      await developer.createProject({ name: newProjectName, description: newProjectDesc });
      setNewProjectName("");
      setNewProjectDesc("");
      setIsCreatingProject(false);
      loadProjects();
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project? All associated keys will be irrevocably revoked.")) return;
    try {
      await developer.deleteProject(id);
      if (selectedProjectId === id) setSelectedProjectId(null);
      loadProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !newKeyName.trim()) return;

    try {
      const createdKey = await developer.createKey(selectedProjectId, { name: newKeyName });
      setNewKeyName("");
      setIsCreatingKey(false);
      setNewlyCreatedToken(createdKey.token);
      loadKeys(selectedProjectId);
    } catch (error) {
      console.error("Error creating key:", error);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!selectedProjectId) return;
    if (!confirm("Are you sure you want to revoke this API Key? Any dependent applications will stop working immediately.")) return;

    try {
      await developer.revokeKey(selectedProjectId, keyId);
      loadKeys(selectedProjectId);
    } catch (error) {
      console.error("Error revoking key:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Developers</h1>
        <p className="text-gray-500 mt-2">
          Manage your API Projects and tokens to integrate with third-party applications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Projects List Segment */}
        <div className="lg:col-span-1 bg-white shadow rounded-lg border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="font-semibold text-gray-800">API Projects</h2>
            <button 
              onClick={() => setIsCreatingProject(!isCreatingProject)}
              className="text-indigo-600 hover:text-indigo-800 p-1"
            >
              <PlusCircle size={20} />
            </button>
          </div>

          {isCreatingProject && (
            <div className="p-4 bg-indigo-50 border-b border-indigo-100">
              <form onSubmit={handleCreateProject} className="space-y-3">
                <input
                  type="text"
                  placeholder="Project Name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setIsCreatingProject(false)} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
                  <button type="submit" className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700">Create</button>
                </div>
              </form>
            </div>
          )}

          <ul className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {projects.length === 0 && !isCreatingProject && (
              <li className="p-4 text-sm text-gray-500 text-center">No projects available. Create one to get started.</li>
            )}
            {projects.map((proj) => (
              <li 
                key={proj.id} 
                className={`p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${selectedProjectId === proj.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''}`}
                onClick={() => setSelectedProjectId(proj.id)}
              >
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{proj.name}</h3>
                  {proj.description && <p className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">{proj.description}</p>}
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteProject(proj.id); }}
                  className="text-red-400 hover:text-red-600 p-1"
                  title="Delete Project"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* API Keys Segment */}
        <div className="lg:col-span-2">
          {selectedProjectId ? (
            <div className="bg-white shadow rounded-lg border border-gray-100">
               <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="font-semibold text-gray-800">
                  API Keys for {projects.find((p) => p.id === selectedProjectId)?.name}
                </h2>
                <button
                  onClick={() => setIsCreatingKey(!isCreatingKey)}
                  className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-indigo-700 flex items-center gap-2"
                >
                  <Key size={16} /> Generate Key
                </button>
              </div>

              <div className="p-6 space-y-6">
                {isCreatingKey && (
                  <form onSubmit={handleCreateKey} className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Key Name</label>
                    <div className="flex gap-4">
                      <input
                        type="text"
                        placeholder="e.g., Zapier Integration"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        className="flex-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      />
                      <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-900">
                        Generate
                      </button>
                      <button type="button" onClick={() => setIsCreatingKey(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {newlyCreatedToken && (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-green-800 mb-2">Your new API key</h3>
                    <p className="text-sm text-green-700 mb-4">
                      Please copy this key and save it somewhere safe. For security reasons, <strong>we cannot show it to you again</strong>.
                    </p>
                    <div className="flex items-center gap-2 bg-white p-2 rounded border border-green-200">
                      <code className="text-sm flex-1 text-gray-800 break-all">{newlyCreatedToken}</code>
                      <button
                        onClick={() => copyToClipboard(newlyCreatedToken)}
                        className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        {copiedToken ? <CheckCircle size={20} className="text-green-500" /> : <Copy size={20} />}
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  {keys.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No API keys generated yet for this project.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prefix</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {keys.map((key) => (
                            <tr key={key.id}>
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{key.name}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500"><code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{key.token_prefix}</code></td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(key.created_at).toLocaleDateString()}</td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${key.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {key.is_active ? 'Active' : 'Revoked'}
                                </span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {key.is_active && (
                                  <button
                                    onClick={() => handleRevokeKey(key.id)}
                                    className="text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded"
                                  >
                                    Revoke
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center text-center">
              <Key size={48} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Project</h3>
              <p className="text-sm text-gray-500 max-w-sm">
                Choose a project from the sidebar to view and manage its API keys, or create a new project.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
