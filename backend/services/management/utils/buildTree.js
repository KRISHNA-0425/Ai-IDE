export const buildTree = (files) => {
    if (!Array.isArray(files) || files.length === 0) {
        return [];
    }

    const map = {};
    const tree = [];

    // Step 1: Initialize all files into the lookup map with empty children array
    files.forEach(file => {
        const fileObj = typeof file.toObject === 'function' ? file.toObject() : { ...file };
        const id = (file._id || file.id).toString();

        map[id] = {
            ...fileObj,
            children: []
        };
    });

    // Step 2: Establish parent-child relationships
    files.forEach(file => {
        const id = (file._id || file.id).toString();

        if (file.parentId) {
            const parent = map[file.parentId.toString()];
            if (parent) {
                parent.children.push(map[id]);
            } else {
                // If parent not found (e.g., orphaned or root-level fallback), add to tree root
                tree.push(map[id]);
            }
        } else {
            tree.push(map[id]);
        }
    });

    // Step 3 (Optional UI polish): Sort children so folders appear before files, then alphabetically
    const sortNodes = (nodes) => {
        nodes.sort((a, b) => {
            if (a.type !== b.type) {
                return a.type === 'folder' ? -1 : 1;
            }
            return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        });
        nodes.forEach(node => {
            if (node.children && node.children.length > 0) {
                sortNodes(node.children);
            }
        });
    };

    sortNodes(tree);

    return tree;
};

export default buildTree;
