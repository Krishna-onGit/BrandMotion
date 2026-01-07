/**
 * LocalStorage Service for BrandMotion
 * Handles project persistence, autosave, and retrieval.
 */

const STORAGE_KEY = 'brandmotion_projects';
const AUTOSAVE_KEY = 'brandmotion_last_project_id';

/**
 * Generate a UUID (simple version)
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Get all projects
 */
export function getProjects() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Failed to load projects', e);
        return [];
    }
}

/**
 * Save a project (Create or Update)
 */
export function saveProject(project) {
    try {
        const projects = getProjects();
        const index = projects.findIndex(p => p.id === project.id);

        const updatedProject = {
            ...project,
            lastEdited: new Date().toISOString()
        };

        if (index >= 0) {
            projects[index] = updatedProject;
        } else {
            projects.push(updatedProject);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
        localStorage.setItem(AUTOSAVE_KEY, project.id); // Set as active
        return updatedProject;
    } catch (e) {
        console.error('Failed to save project', e);
        return null;
    }
}

/**
 * Get the last active project ID
 */
export function getLastProjectId() {
    return localStorage.getItem(AUTOSAVE_KEY);
}

/**
 * Get a specific project by ID
 */
export function getProjectById(id) {
    const projects = getProjects();
    return projects.find(p => p.id === id);
}

/**
 * Delete a project
 */
export function deleteProject(id) {
    const projects = getProjects().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

/**
 * Create a new empty project structure
 */
export function createNewProject(brand, templateId) {
    return {
        id: generateId(),
        name: 'New Project',
        brand: brand,
        templateId: templateId,
        scenes: [],
        audio: { enabled: false },
        createdAt: new Date().toISOString(),
        lastEdited: new Date().toISOString()
    };
}
