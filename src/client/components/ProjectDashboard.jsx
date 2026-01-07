import React, { useEffect, useState } from 'react';
import { getProjects, getLastProjectId, deleteProject, getProjectById } from '../../utils/storage';

export default function ProjectDashboard({ onOpenProject, onNewProject }) {
    const [projects, setProjects] = useState([]);
    const [lastProject, setLastProject] = useState(null);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = () => {
        const all = getProjects();
        // Sort by last edited desc
        all.sort((a, b) => new Date(b.lastEdited) - new Date(a.lastEdited));
        setProjects(all);

        const lastId = getLastProjectId();
        if (lastId) {
            setLastProject(all.find(p => p.id === lastId));
        }
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this project?')) {
            deleteProject(id);
            loadProjects();
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 animate-fadeIn">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-lg shadow-sky-500/20">
                    B
                </div>
                <h1 className="text-4xl font-bold mb-2">Welcome to BrandMotion</h1>
                <p className="text-zinc-400">Create stunning brand videos in minutes.</p>
            </div>

            {/* Main Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {/* Continue Last */}
                {lastProject ? (
                    <div
                        onClick={() => onOpenProject(lastProject)}
                        className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 cursor-pointer hover:border-sky-500/50 hover:bg-zinc-800/50 transition-all shadow-lg hover:shadow-sky-900/10"
                    >
                        <div className="absolute top-4 right-4 text-xs font-mono text-sky-400 bg-sky-400/10 px-2 py-1 rounded">RESUME</div>
                        <h3 className="text-xl font-bold mb-2 text-white group-hover:text-sky-400 transition-colors">Continue Editing</h3>
                        <p className="text-white font-medium truncate mb-1">{lastProject.name || "Untitled Project"}</p>
                        <p className="text-sm text-zinc-500">
                            Last edited {new Date(lastProject.lastEdited).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                ) : (
                    <div className="bg-zinc-900/50 border border-zinc-800 border-dashed rounded-2xl p-6 flex flex-col justify-center items-center text-zinc-600">
                        <span className="text-sm">No recent projects</span>
                    </div>
                )}

                {/* Create New */}
                <div
                    onClick={onNewProject}
                    className="group bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 cursor-pointer hover:border-indigo-500/50 hover:bg-zinc-800/50 transition-all flex flex-col justify-center items-center text-center shadow-lg"
                >
                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">Create New Project</h3>
                    <p className="text-sm text-zinc-500">Start from scratch with a brand setup</p>
                </div>
            </div>

            {/* Project List */}
            {projects.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4 px-2">All Projects</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {projects.map(project => (
                            <div
                                key={project.id}
                                onClick={() => onOpenProject(project)}
                                className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center text-zinc-600 font-bold border border-zinc-700">
                                        {project.name ? project.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white group-hover:text-white transition-colors">
                                            {project.name || "Untitled Project"}
                                        </h4>
                                        <p className="text-xs text-zinc-500">
                                            {project.scenes?.length || 0} Scenes • {new Date(project.lastEdited).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => handleDelete(e, project.id)}
                                    className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    title="Delete Project"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
