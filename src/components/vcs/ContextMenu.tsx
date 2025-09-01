import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GitBranch, GitMerge, GitCompare, GitPullRequest, Upload, Download, 
  Copy, Edit, Star, Eye, Code, Trash2, Terminal, Settings, RefreshCw 
} from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  type: 'local' | 'remote' | 'stream';
  current?: boolean;
  upstream?: string;
  ahead?: number;
  behind?: number;
  lastCommit: {
    hash: string;
    message: string;
    author: string;
    date: Date;
  };
  parentStream?: string;
  childStreams?: string[];
  protected?: boolean;
  starred?: boolean;
  color?: string;
}

interface ContextMenuProps {
  x: number;
  y: number;
  branch: Branch;
  isDark: boolean;
  onClose: () => void;
  onAction: (action: string, branch: Branch) => void;
}

export function ContextMenu({ x, y, branch, isDark, onClose, onAction }: ContextMenuProps) {

  const handleAction = (action: string) => {
    onAction(action, branch);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className={`fixed z-50 ${isDark ? 'glass-card' : 'glass-card-light'} p-1 min-w-48`}
      style={{ 
        left: Math.min(x, window.innerWidth - 200),
        top: Math.min(y, window.innerHeight - 400)
      }}
      onClick={(e) => e.stopPropagation()}
    >
          <div className="space-y-0.5">
            {/* Primary Actions */}
            {!branch.current && (
              <button
                onClick={() => handleAction('checkout')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                  isDark ? 'hover:bg-white/10' : 'hover:bg-white/50'
                }`}
              >
                <GitBranch className="w-4 h-4 text-green-400" />
                <span>Switch to branch</span>
              </button>
            )}

            <button
              onClick={() => handleAction('merge')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                isDark ? 'hover:bg-white/10' : 'hover:bg-white/50'
              }`}
            >
              <GitMerge className="w-4 h-4 text-purple-400" />
              <span>Merge into current</span>
            </button>

            <button
              onClick={() => handleAction('compare')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                isDark ? 'hover:bg-white/10' : 'hover:bg-white/50'
              }`}
            >
              <GitCompare className="w-4 h-4 text-blue-400" />
              <span>Compare branches</span>
            </button>

            <button
              onClick={() => handleAction('pull-request')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                isDark ? 'hover:bg-white/10' : 'hover:bg-white/50'
              }`}
            >
              <GitPullRequest className="w-4 h-4 text-indigo-400" />
              <span>Create pull request</span>
            </button>

            {/* Divider */}
            <div className="border-t border-white/10 my-1" />

            {/* Remote Actions */}
            {branch.upstream && (
              <>
                <button
                  onClick={() => handleAction('push')}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                    isDark ? 'hover:bg-white/10' : 'hover:bg-white/50'
                  }`}
                >
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span>Push changes</span>
                  {branch.ahead! > 0 && (
                    <span className="ml-auto text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                      +{branch.ahead}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleAction('pull')}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                    isDark ? 'hover:bg-white/10' : 'hover:bg-white/50'
                  }`}
                >
                  <Download className="w-4 h-4 text-orange-400" />
                  <span>Pull changes</span>
                  {branch.behind! > 0 && (
                    <span className="ml-auto text-xs bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded">
                      -{branch.behind}
                    </span>
                  )}
                </button>

                <div className="border-t border-white/10 my-1" />
              </>
            )}

            {/* Utility Actions */}
            <button
              onClick={() => handleAction('copy-name')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                isDark ? 'hover:bg-white/10' : 'hover:bg-white/50'
              }`}
            >
              <Copy className="w-4 h-4 text-gray-400" />
              <span>Copy branch name</span>
            </button>

            <button
              onClick={() => handleAction('copy-hash')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                isDark ? 'hover:bg-white/10' : 'hover:bg-white/50'
              }`}
            >
              <Copy className="w-4 h-4 text-gray-400" />
              <span>Copy commit hash</span>
            </button>

            <button
              onClick={() => handleAction('rename')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                isDark ? 'hover:bg-white/10' : 'hover:bg-white/50'
              }`}
            >
              <Edit className="w-4 h-4 text-gray-400" />
              <span>Rename branch</span>
            </button>

            <button
              onClick={() => handleAction('star')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                isDark ? 'hover:bg-white/10' : 'hover:bg-white/50'
              }`}
            >
              <Star className={`w-4 h-4 ${branch.starred ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
              <span>{branch.starred ? 'Unstar' : 'Star'} branch</span>
            </button>

            {/* Divider */}
            <div className="border-t border-white/10 my-1" />

            {/* View Actions */}
            <button
              onClick={() => handleAction('view-commits')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                isDark ? 'hover:bg-white/10' : 'hover:bg-white/50'
              }`}
            >
              <Eye className="w-4 h-4 text-blue-400" />
              <span>View commits</span>
            </button>

            <button
              onClick={() => handleAction('view-files')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                isDark ? 'hover:bg-white/10' : 'hover:bg-white/50'
              }`}
            >
              <Code className="w-4 h-4 text-green-400" />
              <span>Browse files</span>
            </button>

            <button
              onClick={() => handleAction('terminal')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                isDark ? 'hover:bg-white/10' : 'hover:bg-white/50'
              }`}
            >
              <Terminal className="w-4 h-4 text-purple-400" />
              <span>Open in terminal</span>
            </button>

            {/* Advanced Actions */}
            <div className="border-t border-white/10 my-1" />

            <button
              onClick={() => handleAction('rebase')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                isDark ? 'hover:bg-white/10' : 'hover:bg-white/50'
              }`}
            >
              <RefreshCw className="w-4 h-4 text-indigo-400" />
              <span>Rebase onto current</span>
            </button>

            <button
              onClick={() => handleAction('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                isDark ? 'hover:bg-white/10' : 'hover:bg-white/50'
              }`}
            >
              <Settings className="w-4 h-4 text-gray-400" />
              <span>Branch settings</span>
            </button>

            {/* Destructive Actions */}
            {!branch.protected && !branch.current && (
              <>
                <div className="border-t border-white/10 my-1" />
                <button
                  onClick={() => handleAction('delete')}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-red-400 ${
                    isDark ? 'hover:bg-red-500/10' : 'hover:bg-red-500/10'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete branch</span>
                </button>
              </>
            )}
          </div>
    </motion.div>
  );
}