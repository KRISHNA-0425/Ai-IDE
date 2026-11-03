import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = (process.env.MANAGMENT_SERVICE_URL || 'http://localhost:8003').replace(/\/+$/, '');
const MANAGEMENT_API = `${BASE_URL}/api/management`;

/**
 * Helper to build auth headers
 */
const getHeaders = (userId) => {
    const headers = {};
    if (userId) {
        headers['x-user-id'] = String(userId);
    }
    return headers;
};

/**
 * Create root folder for a project
 */
export const createRootFolder = async ({ projectId, projectName, userId }) => {
    try {
        const { data } = await axios.post(
            `${MANAGEMENT_API}/createRootFolder`,
            { projectId, projectName },
            { headers: getHeaders(userId) }
        );
        return data;
    } catch (error) {
        console.error('error in createRootFolder:', error?.response?.data || error.message);
        throw error;
    }
};

/**
 * Create a subfolder inside a parent folder
 */
export const createFolder = async ({ projectId, parentId, name, userId }) => {
    try {
        const { data } = await axios.post(
            `${MANAGEMENT_API}/createFolder`,
            { projectId, parentId, name },
            { headers: getHeaders(userId) }
        );
        return data;
    } catch (error) {
        console.error('error in createFolder:', error?.response?.data || error.message);
        throw error;
    }
};

/**
 * Create a new file inside a parent folder
 */
export const createFile = async ({ parentId, projectId, name, content = '', language = 'plainText', userId }) => {
    try {
        const { data } = await axios.post(
            `${MANAGEMENT_API}/createFile`,
            { name, parentId, projectId, content, language },
            { headers: getHeaders(userId) }
        );
        return data;
    } catch (error) {
        console.error('error in createFile:', error?.response?.data || error.message);
        throw error;
    }
};

/**
 * Update an existing file (rename, content, or language)
 */
export const updateFile = async ({ fileId, id, name, content, language, userId }) => {
    try {
        const targetId = fileId || id;
        if (!targetId) {
            throw new Error('fileId is required to update a file');
        }

        const body = {};
        if (name !== undefined) body.name = name;
        if (content !== undefined) body.content = content;
        if (language !== undefined) body.language = language;

        const { data } = await axios.put(
            `${MANAGEMENT_API}/updateFile/${targetId}`,
            body,
            { headers: getHeaders(userId) }
        );
        return data;
    } catch (error) {
        console.error('error in updateFile:', error?.response?.data || error.message);
        throw error;
    }
};

/**
 * Soft delete a file
 */
export const deleteFile = async ({ fileId, id, userId }) => {
    try {
        const targetId = fileId || id;
        if (!targetId) {
            throw new Error('fileId is required to delete a file');
        }

        const { data } = await axios.delete(
            `${MANAGEMENT_API}/deleteFile/${targetId}`,
            { headers: getHeaders(userId) }
        );
        return data;
    } catch (error) {
        console.error('error in deleteFile:', error?.response?.data || error.message);
        throw error;
    }
};

/**
 * Recursively soft delete a folder and all its contents
 */
export const deleteFolder = async ({ folderId, id, userId }) => {
    try {
        const targetId = folderId || id;
        if (!targetId) {
            throw new Error('folderId is required to delete a folder');
        }

        const { data } = await axios.delete(
            `${MANAGEMENT_API}/deleteFolder/${targetId}`,
            { headers: getHeaders(userId) }
        );
        return data;
    } catch (error) {
        console.error('error in deleteFolder:', error?.response?.data || error.message);
        throw error;
    }
};

/**
 * Get file metadata and content by ID
 */
export const getFile = async ({ fileId, id, userId }) => {
    try {
        const targetId = fileId || id;
        if (!targetId) {
            throw new Error('fileId is required to get file');
        }

        const { data } = await axios.get(
            `${MANAGEMENT_API}/file/${targetId}`,
            { headers: getHeaders(userId) }
        );
        return data;
    } catch (error) {
        console.error('error in getFile:', error?.response?.data || error.message);
        throw error;
    }
};

/**
 * Get complete project file tree hierarchy
 */
export const getTree = async ({ projectId, userId }) => {
    try {
        if (!projectId) {
            throw new Error('projectId is required to get tree');
        }

        const { data } = await axios.get(
            `${MANAGEMENT_API}/tree/${projectId}`,
            { headers: getHeaders(userId) }
        );
        return data;
    } catch (error) {
        console.error('error in getTree:', error?.response?.data || error.message);
        throw error;
    }
};
