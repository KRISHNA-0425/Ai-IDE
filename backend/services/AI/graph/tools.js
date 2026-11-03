import { tool } from '@langchain/core/tools';
import { createFile, createFolder, deleteFile, getFile, getTree, updateFile } from '../utils/fetchFileApi.js';
import { z } from 'zod';

const compactTree = (items = []) => {
    if (!Array.isArray(items)) return [];
    return items.map((item) => ({
        _id: item._id,
        parentId: item.parentId,
        name: item.name,
        type: item.type,
        language: item.language,
        extension: item.extension,
        children: compactTree(item.children || [])
    }));
};

export const fileTools = ({ projectId, userId }) => {
    // Tool 1: Get Project File Tree
    const getTreeTools = tool(
        async () => {
            try {
                console.log('get_tree tool called');
                const result = await getTree({ projectId, userId });
                const tree = compactTree(result);
                return JSON.stringify({
                    success: true,
                    tree
                });
            } catch (error) {
                console.error('get_tree tool error:', error?.response?.data || error.message);
                return JSON.stringify({
                    success: false,
                    error: error?.response?.data?.message || error.message || 'Failed to fetch project tree'
                });
            }
        },
        {
            name: 'get_tree',
            description: `
            Get the complete project file and folder tree hierarchy.

            IMPORTANT RULES:
            1. Use this tool when you need to understand the project structure.
            2. Do not repeatedly call get_tree if you already have the tree.
            3. type="folder" means it is a directory.
            4. type="file" means it is a file with readable content.
            5. Use folder _id as the parentId when creating new files or folders.
            6. NEVER call get_file with a folder ID.
            7. Use the exact _id values returned by this tool.
            `,
            schema: z.object({})
        }
    );

    // Tool 2: Get File Content & Metadata
    const getFileTools = tool(
        async ({ fileId }) => {
            try {
                console.log(`get_file tool called for fileId: ${fileId}`);
                const result = await getFile({ fileId, userId });

                if (!result) {
                    return JSON.stringify({
                        success: false,
                        error: `File with id "${fileId}" was not found.`
                    });
                }

                if (result.type !== 'file') {
                    console.log('get_file blocked: target is a folder');
                    return JSON.stringify({
                        success: false,
                        error: `The provided id "${fileId}" belongs to a folder, not a file.`,
                        instruction: "Do not call get_file for folders. Use the folder _id as parentId when creating files or subfolders."
                    });
                }

                return JSON.stringify({
                    success: true,
                    file: {
                        _id: result._id,
                        name: result.name,
                        type: result.type,
                        language: result.language,
                        extension: result.extension,
                        content: result.content ?? '',
                        size: result.size ?? 0,
                        parentId: result.parentId
                    }
                });
            } catch (error) {
                console.error('get_file tool error:', error?.response?.data || error.message);
                return JSON.stringify({
                    success: false,
                    error: error?.response?.data?.message || error.message || 'Failed to fetch file'
                });
            }
        },
        {
            name: 'get_file',
            description: `
            Read an EXISTING FILE before modifying it.
            STRICT RULES:

            1. fileId must belong to a file.
            2. NEVER pass a folder ID.
            3. Use exact file ID from get_tree.
            4. Call this before update_file.
            5. Do not call this for newly created files unless necessary.
            6. Do not call this repeatedly for the same file.

            The response contains the complete file content.
            `,
            schema: z.object({
                fileId: z.string().describe("The exact _id of the file to retrieve.")
            })
        }
    );

    // Tool 3: Create folder
    const createFolderTool = tool(
        async ({ name, parentId }) => {
            try {
                console.log(`create_folder tool called for name: "${name}" under parentId: ${parentId}`);
                const folder = await createFolder({ name, parentId, projectId, userId });

                return JSON.stringify({
                    success: true,
                    folder: {
                        _id: folder._id,
                        name: folder.name,
                        type: folder.type,
                        parentId: folder.parentId,
                        projectId: folder.projectId
                    }
                });
            } catch (error) {
                console.error('create_folder tool error:', error?.response?.data || error.message);
                return JSON.stringify({
                    success: false,
                    error: error?.response?.data?.message || error.message || 'Failed to create folder'
                });
            }
        },
        {
            name: 'create_folder',
            description: `
            Create a new folder.

            RULES:

            1. Create parent folders first.
            2. Use exact parentId from get_tree.
            3. Never create duplicate folders.
            4. A folder directly inside another folder must use that
            folder's ID as parentId.
            5. After creation continue with the remaining files.
            6. Do not call get_tree again just to verify the folder.
            `,
            schema: z.object({
                name: z.string().describe("The name of the new folder to create (e.g. 'controllers', 'components')."),
                parentId: z.string().describe("The _id of the parent folder where this new folder will reside.")
            })
        }
    );

    // Tool 4: Create file 
    const createFileTool = tool(
        async ({ name, parentId, content = '', language }) => {
            try {
                console.log(`create_file tool called for file: "${name}" under parentId: ${parentId}`);
                const file = await createFile({
                    name,
                    parentId,
                    projectId,
                    content,
                    language: language || 'plainText',
                    userId
                });

                return JSON.stringify({
                    success: true,
                    file: {
                        _id: file._id,
                        name: file.name,
                        type: file.type,
                        language: file.language,
                        extension: file.extension,
                        size: file.size,
                        parentId: file.parentId,
                        projectId: file.projectId
                    }
                });
            } catch (error) {
                console.error('create_file tool error:', error?.response?.data || error.message);
                return JSON.stringify({
                    success: false,
                    error: error?.response?.data?.message || error.message || 'Failed to create file'
                });
            }
        },
        {
            name: 'create_file',
            description: `
            Create a NEW FILE.

            RULES:

            1. Use get_tree first when project structure is unknown.
            2. Use exact folder ID as parentId.
            3. Never create duplicate files.
            4. Send complete file content.
            5. Create folders before files inside them.
            6. Never use terminal commands to create files.
            7. Do not call get_file immediately after creating a file.
            8. Continue creating all required files.
            9. Do not stop after creating only one file.

            For a React/Vite project, create ALL required files.
            `,
            schema: z.object({
                name: z.string().describe("The file name including its extension, e.g. 'index.js', 'App.jsx', 'package.json'."),
                parentId: z.string().describe("The _id of the parent folder where this file will be created."),
                content: z.string().default('').describe("The full initial code or text content for the file."),
                language: z.string().optional().describe("The programming language identifier, e.g. 'javascript', 'typescript', 'css', 'html', 'json', 'python'.")
            })
        }
    );
 
    // Tool 5: Update file
    const updateFileTool = tool(
        async ({ fileId, content, name, language }) => {
            try {
                console.log(`update_file tool called for fileId: ${fileId}`);
                const updatedFile = await updateFile({
                    fileId,
                    content,
                    name,
                    language,
                    userId
                });

                return JSON.stringify({
                    success: true,
                    file: {
                        _id: updatedFile._id,
                        name: updatedFile.name,
                        type: updatedFile.type,
                        language: updatedFile.language,
                        extension: updatedFile.extension,
                        size: updatedFile.size,
                        parentId: updatedFile.parentId
                    }
                });
            } catch (error) {
                console.error('update_file tool error:', error?.response?.data || error.message);
                return JSON.stringify({
                    success: false,
                    error: error?.response?.data?.message || error.message || 'Failed to update file'
                });
            }
        },
        {
            name: 'update_file',
            description: `
            Update an EXISTING FILE.

            RULES:

            1. Call get_file before updating.
            2. fileId must be an actual file ID.
            3. NEVER use a folder ID.
            4. Send the complete updated file content.
            5. Do not update files that do not exist.
            6. After successful update continue with remaining work.
            7. Do not call get_file again unless another modification is needed.
            `,
            schema: z.object({
                fileId: z.string().describe("The exact _id of the file to update."),
                content: z.string().optional().describe("The complete new code or text content for the file."),
                name: z.string().optional().describe("New file name with extension if renaming the file (e.g. 'App.jsx')."),
                language: z.string().optional().describe("Updated programming language identifier (e.g. 'javascript', 'typescript').")
            })
        }
    );

    // Tool 6: Delete file
    const deleteFileTool = tool(
        async ({ fileId }) => {
            try {
                console.log(`delete_file tool called for fileId: ${fileId}`);
                await deleteFile({ fileId, userId });

                return JSON.stringify({
                    success: true,
                    message: `File with id "${fileId}" deleted successfully`,
                    fileId
                });
            } catch (error) {
                console.error('delete_file tool error:', error?.response?.data || error.message);
                return JSON.stringify({
                    success: false,
                    error: error?.response?.data?.message || error.message || 'Failed to delete file'
                });
            }
        },
        {
            name: 'delete_file',
            description: `
            Delete an EXISTING FILE from the project.

            STRICT RULES:

            1. fileId must belong to an actual file.
            2. NEVER pass a folder ID.
            3. Use the exact file ID from get_tree.
            4. Before deleting, make sure the target is actually a file.
            5. Do not delete a file unless the user's request requires it.
            6. Never use terminal commands to delete files.
            7. After successful deletion, continue with the remaining work.
            8. Do not call get_file after deletion.
            `,
            schema: z.object({
                fileId: z.string().describe("The exact _id of the file to delete.")
            })
        }
    );

    // Return all initialized tools as an array for LangChain / LangGraph
    return [getTreeTools, getFileTools, createFolderTool, createFileTool, updateFileTool, deleteFileTool];
};
