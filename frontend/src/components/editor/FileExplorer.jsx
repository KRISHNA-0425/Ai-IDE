import React, { useState } from 'react'
import {
  VscFolder,
  VscFolderOpened,
  VscFile,
  VscFileCode,
  VscNewFile,
  VscNewFolder,
  VscRefresh,
  VscCollapseAll,
  VscChevronRight,
  VscChevronDown,
  VscSearch
} from 'react-icons/vsc'
import { getFileIcon } from '../../utils/fileIcons.jsx'
export { getFileIcon }

const TreeNode = ({
  node,
  depth = 0,
  activeFile,
  onSelectFile,
  expandedFolders,
  toggleFolder
}) => {
  const isFolder = node.type === 'folder'
  const isExpanded = expandedFolders[node.id]
  const isActive = activeFile?.id === node.id

  return (
    <div>
      <div
        onClick={() => {
          if (isFolder) {
            toggleFolder(node.id)
          } else {
            onSelectFile(node)
          }
        }}
        style={{ paddingLeft: `${depth * 14 + 12}px` }}
        className={`group flex items-center justify-between py-1.5 pr-2.5 cursor-pointer select-none text-[13px] font-sans transition-colors rounded-sm mx-1 ${
          isActive
            ? 'bg-white/[0.08] text-white font-medium'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
        }`}
      >
        <div className="flex items-center gap-1.5 truncate min-w-0">
          {isFolder ? (
            <>
              <span className="text-slate-500 group-hover:text-slate-300 transition-colors">
                {isExpanded ? (
                  <VscChevronDown className="text-xs" />
                ) : (
                  <VscChevronRight className="text-xs" />
                )}
              </span>
              <span className="text-amber-400/90 text-sm">
                {isExpanded ? <VscFolderOpened /> : <VscFolder />}
              </span>
            </>
          ) : (
            <>
              <span className="w-3"></span>
              {getFileIcon(node.name)}
            </>
          )}
          <span className="truncate">{node.name}</span>
        </div>
      </div>

      {isFolder && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              activeFile={activeFile}
              onSelectFile={onSelectFile}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const FileExplorer = ({
  fileTree = [],
  activeFile,
  onSelectFile,
  projectName = 'Project Workspace'
}) => {
  const [expandedFolders, setExpandedFolders] = useState({
    root: true,
    'src-folder': true
  })
  const [filterQuery, setFilterQuery] = useState('')
  const [creatingType, setCreatingType] = useState(null) // 'file' | 'folder' | null
  const [newItemName, setNewItemName] = useState('')

  const toggleFolder = (folderId) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId]
    }))
  }

  const handleCollapseAll = () => {
    setExpandedFolders({})
  }

  const handleCreateSubmit = (e) => {
    e.preventDefault()
    if (!newItemName.trim()) {
      setCreatingType(null)
      return
    }
    // UI placeholder creation action
    setCreatingType(null)
    setNewItemName('')
  }

  return (
    <div className="h-full flex flex-col bg-[#0b0e14] border-r border-white/[0.06] select-none text-slate-300 font-sans">
      {/* Explorer Header */}
      <div className="px-3 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
          Explorer
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCreatingType('file')}
            title="New File"
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-white/[0.08] rounded transition-colors cursor-pointer"
          >
            <VscNewFile className="text-xs" />
          </button>
          <button
            onClick={() => setCreatingType('folder')}
            title="New Folder"
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-white/[0.08] rounded transition-colors cursor-pointer"
          >
            <VscNewFolder className="text-xs" />
          </button>
          <button
            onClick={handleCollapseAll}
            title="Collapse All Folders"
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-white/[0.08] rounded transition-colors cursor-pointer"
          >
            <VscCollapseAll className="text-xs" />
          </button>
          <button
            title="Refresh"
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-white/[0.08] rounded transition-colors cursor-pointer"
          >
            <VscRefresh className="text-xs" />
          </button>
        </div>
      </div>

      {/* Project Root Label */}
      <div className="px-3 py-1.5 flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider bg-white/[0.02]">
        <div className="flex items-center gap-1.5 truncate">
          <VscChevronDown className="text-slate-500 text-[10px]" />
          <span className="truncate font-mono text-[11px] text-slate-200 lowercase">
            {projectName}
          </span>
        </div>
      </div>

      {/* Inline Create Input when clicking New File or New Folder */}
      {creatingType && (
        <form onSubmit={handleCreateSubmit} className="px-3 py-1.5 bg-white/[0.04] border-b border-white/[0.08]">
          <div className="flex items-center gap-1.5">
            {creatingType === 'folder' ? (
              <VscFolder className="text-amber-400 text-xs shrink-0" />
            ) : (
              <VscFile className="text-slate-300 text-xs shrink-0" />
            )}
            <input
              autoFocus
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onBlur={() => setCreatingType(null)}
              placeholder={`new-${creatingType}...`}
              className="w-full bg-[#141824] border border-white/[0.2] rounded px-1.5 py-0.5 text-xs text-white outline-none font-mono"
            />
          </div>
        </form>
      )}

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto py-1">
        {fileTree.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            depth={0}
            activeFile={activeFile}
            onSelectFile={onSelectFile}
            expandedFolders={expandedFolders}
            toggleFolder={toggleFolder}
          />
        ))}
      </div>

      {/* Quick Search at bottom of file tree */}
      <div className="p-2 border-t border-white/[0.06] bg-[#090b10]">
        <div className="flex items-center gap-2 bg-[#121622] px-2 py-1 rounded border border-white/[0.06] text-xs text-slate-400">
          <VscSearch className="text-xs shrink-0 text-slate-500" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search files..."
            className="w-full bg-transparent outline-none text-slate-200 placeholder:text-slate-500 text-xs font-mono"
          />
        </div>
      </div>
    </div>
  )
}

export default FileExplorer
