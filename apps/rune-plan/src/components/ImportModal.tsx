import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, AlertCircle, FolderOpen, FileUp } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Issue } from '../types';

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (issues: Issue[]) => void;
}

export function ImportModal({ open, onOpenChange, onImport }: ImportModalProps) {
  const [markdownInput, setMarkdownInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [previewIssues, setPreviewIssues] = useState<Partial<Issue>[]>([]);
  const [importMode, setImportMode] = useState<'markdown' | 'rune-files'>('markdown');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = (projectPrefix: string = 'IMP') => 
    `${projectPrefix}-${Math.floor(Math.random() * 1000) + 1}`;

  const parseMarkdown = () => {
    try {
      setError(null);
      const lines = markdownInput.trim().split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        setError('Please enter some markdown content');
        return;
      }

      const issues: Issue[] = [];
      let currentIssue: Partial<Issue> | null = null;
      let inCodeBlock = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines
        if (!line) continue;
        
        // Handle code blocks
        if (line.startsWith('```')) {
          inCodeBlock = !inCodeBlock;
          if (currentIssue) {
            currentIssue.description = (currentIssue.description || '') + '\n' + line;
          }
          continue;
        }
        
        // Skip lines inside code blocks (but add to description)
        if (inCodeBlock) {
          if (currentIssue) {
            currentIssue.description = (currentIssue.description || '') + '\n' + line;
          }
          continue;
        }
        
        // Headers become issue titles
        if (line.startsWith('# ') || line.startsWith('## ') || line.startsWith('### ')) {
          // Save previous issue
          if (currentIssue && currentIssue.title) {
            issues.push({
              ...currentIssue,
              id: currentIssue.id || generateId(),
              title: currentIssue.title,
              status: currentIssue.status || 'todo',
              priority: currentIssue.priority || 'medium',
              description: currentIssue.description || '',
              labels: currentIssue.labels || [],
              projectId: currentIssue.projectId || 'imported',
              attachments: [],
              subIssues: [],
              activity: [{
                id: '1',
                type: 'comment',
                user: 'System',
                content: 'Issue imported from Markdown',
                timestamp: 'just now'
              }]
            } as Issue);
          }
          
          // Start new issue
          const title = line.replace(/^#+\s*/, '');
          currentIssue = { title };
        }
        // Parse metadata from lists
        else if (line.startsWith('- ') && currentIssue) {
          const content = line.substring(2).trim();
          
          // Parse status
          if (content.toLowerCase().includes('status:')) {
            const status = content.split(':')[1]?.trim().toLowerCase();
            if (['todo', 'in-progress', 'done', 'backlog', 'cancelled'].includes(status)) {
              currentIssue.status = status as Issue['status'];
            }
          }
          // Parse priority
          else if (content.toLowerCase().includes('priority:')) {
            const priority = content.split(':')[1]?.trim().toLowerCase();
            if (['lowest', 'low', 'medium', 'high', 'urgent', 'critical'].includes(priority)) {
              currentIssue.priority = priority as Issue['priority'];
            }
          }
          // Parse assignee
          else if (content.toLowerCase().includes('assignee:')) {
            const assigneeName = content.split(':')[1]?.trim();
            if (assigneeName && assigneeName !== 'none') {
              currentIssue.assignee = {
                name: assigneeName,
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b734?w=32&h=32&fit=crop&crop=face'
              };
            }
          }
          // Parse due date
          else if (content.toLowerCase().includes('due:') || content.toLowerCase().includes('deadline:')) {
            const date = content.split(':')[1]?.trim();
            if (date) {
              currentIssue.deadline = date;
            }
          }
          // Parse labels
          else if (content.toLowerCase().includes('labels:') || content.toLowerCase().includes('tags:')) {
            const labelsStr = content.split(':')[1]?.trim();
            if (labelsStr) {
              currentIssue.labels = labelsStr.split(',').map(l => l.trim()).filter(Boolean);
            }
          }
          // Parse project
          else if (content.toLowerCase().includes('project:')) {
            const project = content.split(':')[1]?.trim();
            if (project) {
              currentIssue.projectId = project.toLowerCase().replace(/\s+/g, '-');
            }
          }
          // Regular list items become description
          else {
            currentIssue.description = (currentIssue.description || '') + '\n- ' + content;
          }
        }
        // Regular text becomes description
        else if (currentIssue) {
          currentIssue.description = (currentIssue.description || '') + '\n' + line;
        }
      }
      
      // Save the last issue
      if (currentIssue && currentIssue.title) {
        issues.push({
          ...currentIssue,
          id: currentIssue.id || generateId(),
          title: currentIssue.title,
          status: currentIssue.status || 'todo',
          priority: currentIssue.priority || 'medium',
          description: currentIssue.description?.trim() || '',
          labels: currentIssue.labels || [],
          projectId: currentIssue.projectId || 'imported',
          attachments: [],
          subIssues: [],
          activity: [{
            id: '1',
            type: 'comment',
            user: 'System',
            content: 'Issue imported from Markdown',
            timestamp: 'just now'
          }]
        } as Issue);
      }
      
      if (issues.length === 0) {
        setError('No valid issues found in markdown. Use headers (# ## ###) to define issue titles.');
        return;
      }

      setPreviewIssues(issues);
    } catch (err) {
      setError('Error parsing markdown. Please check your format.');
    }
  };

  // Parse .rune plan files
  const parseRunePlanFile = (content: string, filename: string) => {
    try {
      setError(null);
      
      // Extract issue ID from filename (e.g., "RUN-19-user-authentication-system.md")
      const idMatch = filename.match(/^(RUN-\d+)/);
      const issueId = idMatch ? idMatch[1] : generateId();
      
      const lines = content.split('\n');
      let title = '';
      let status: Issue['status'] = 'todo';
      let priority: Issue['priority'] = 'medium';
      let description = '';
      let assignee: Issue['assignee'] = undefined;
      let labels: string[] = [];
      let projectId = 'imported';
      let estimation: number | undefined;
      let team = '';
      let release = '';
      
      let inDescription = false;
      let inTable = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Extract title from first header
        if (line.startsWith('# ') && !title) {
          title = line.substring(2).trim();
          continue;
        }
        
        // Parse status and type from the subtitle line (e.g., "**RUN-19** • Story • ○ planned • High")
        if (line.includes('•') && (line.includes('planned') || line.includes('active') || line.includes('done'))) {
          const parts = line.split('•').map(p => p.trim());
          
          // Extract status
          if (line.includes('○ planned')) status = 'todo';
          else if (line.includes('● active') || line.includes('● in-progress')) status = 'in-progress';
          else if (line.includes('✓ done') || line.includes('✓ completed')) status = 'done';
          else if (line.includes('○ backlog')) status = 'backlog';
          else if (line.includes('✗ cancelled')) status = 'cancelled';
          
          // Extract priority (usually last part)
          const lastPart = parts[parts.length - 1]?.toLowerCase();
          if (lastPart?.includes('critical')) priority = 'critical';
          else if (lastPart?.includes('high')) priority = 'high';  
          else if (lastPart?.includes('medium')) priority = 'medium';
          else if (lastPart?.includes('low')) priority = 'low';
          else if (lastPart?.includes('lowest')) priority = 'lowest';
          
          continue;
        }
        
        // Parse metadata table
        if (line.startsWith('|') && (line.includes('Field') || line.includes('Value'))) {
          inTable = true;
          continue;
        }
        
        if (inTable && line.startsWith('|')) {
          const cells = line.split('|').map(cell => cell.trim()).filter(Boolean);
          
          if (cells.length >= 2) {
            const field = cells[0].toLowerCase().replace(/\*/g, '');
            const value = cells[1];
            
            switch (field) {
              case 'team':
                team = value;
                projectId = value !== 'Unassigned' ? value : 'imported';
                break;
              case 'assignee':
                if (value !== 'Unassigned') {
                  assignee = {
                    name: value,
                    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b734?w=32&h=32&fit=crop&crop=face'
                  };
                }
                break;
              case 'estimate':
                const estimateMatch = value.match(/(\d+)/);
                if (estimateMatch) {
                  estimation = parseInt(estimateMatch[1]);
                }
                break;
              case 'release':
                release = value;
                break;
              case 'labels':
                if (value !== 'None') {
                  labels = value.split(',').map(l => l.trim());
                }
                break;
            }
          }
          continue;
        }
        
        // Check for end of table
        if (inTable && line === '---') {
          inTable = false;
          inDescription = true;
          continue;
        }
        
        // Collect description content
        if (inDescription && line) {
          // Skip section headers for cleaner description
          if (!line.startsWith('##') || line.startsWith('## Description')) {
            if (line.startsWith('## ')) {
              description += '\n\n' + line + '\n';
            } else {
              description += line + '\n';
            }
          }
        }
      }
      
      const issue: Issue = {
        id: issueId,
        title: title || 'Untitled Plan',
        status,
        priority,
        description: description.trim(),
        labels,
        projectId,
        estimation,
        assignee,
        attachments: [],
        subIssues: [],
        activity: [{
          id: '1',
          type: 'comment',
          user: 'System',
          content: `Issue imported from .rune plan file: ${filename}`,
          timestamp: 'just now'
        }]
      };
      
      return issue;
      
    } catch (err) {
      console.error('Error parsing .rune plan file:', err);
      return null;
    }
  };

  // Handle file upload for .rune plan files
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setError(null);
      const importedIssues: Issue[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Only process .md files (assume they are .rune plan files)
        if (file.name.endsWith('.md')) {
          const content = await file.text();
          const issue = parseRunePlanFile(content, file.name);
          if (issue) {
            importedIssues.push(issue);
          }
        }
      }
      
      if (importedIssues.length === 0) {
        setError('No valid .rune plan files found. Please select .md files from your .rune/plans directory.');
        return;
      }
      
      setPreviewIssues(importedIssues);
      
    } catch (err) {
      setError('Error reading files. Please try again.');
    }
  };

  const handleImport = () => {
    if (previewIssues.length > 0) {
      onImport(previewIssues as Issue[]);
      setMarkdownInput('');
      setPreviewIssues([]);
      setError(null);
    }
  };

  const sampleMarkdown = `# Fix login bug
- Status: todo
- Priority: high  
- Assignee: Alice Johnson
- Due: 2025-01-20
- Labels: Bug, Frontend
- Project: Core Platform

Users cannot login with email address. This affects all user authentication flows.

## Steps to reproduce:
1. Go to login page
2. Enter valid email and password
3. Click login button
4. Error message appears

# Update API documentation
- Status: todo
- Priority: low
- Assignee: Bob Smith
- Due: 2025-01-25
- Labels: Documentation
- Project: Marketing Site

The API documentation needs to be updated with the new endpoints and authentication methods.

\`\`\`typescript
// Example code block
const apiClient = new APIClient({
  baseURL: 'https://api.example.com',
  auth: { token: 'your-token' }
});
\`\`\`

## Additional Notes
- Include examples for all endpoints
- Update authentication guide
- Add troubleshooting section`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Issues
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 space-y-4">
          {/* Import Mode Tabs */}
          <div className="border-b">
            <div className="flex space-x-8">
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  importMode === 'markdown' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setImportMode('markdown')}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Markdown Import
              </button>
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  importMode === 'rune-files' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setImportMode('rune-files')}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                .rune Plan Files
              </button>
            </div>
          </div>

          {/* Markdown Import Tab */}
          {importMode === 'markdown' && (
            <div className="space-y-2">
              <Label>Markdown Content</Label>
              <p className="text-xs text-muted-foreground">
                Use headers (# ## ###) for issue titles. Add metadata with list items (- Status: todo). Regular text becomes the description.
              </p>
              <Textarea
                placeholder={sampleMarkdown}
                value={markdownInput}
                onChange={(e) => setMarkdownInput(e.target.value)}
                className="min-h-64 font-mono text-sm resize-none"
              />
              <Button onClick={parseMarkdown} variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Parse Markdown
              </Button>
            </div>
          )}

          {/* .rune Plan Files Import Tab */}
          {importMode === 'rune-files' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>.rune Plan Files</Label>
                <p className="text-xs text-muted-foreground">
                  Upload .md files from your .rune/plans directory. Each file will be converted to an issue with full metadata preservation.
                </p>
                
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center space-y-4">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-1">Upload .rune plan files</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select multiple .md files from your .rune/plans directory
                    </p>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".md,.markdown"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                    <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Files
                    </Button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    <p>Supported files: RUN-*.md from .rune/plans/</p>
                    <p>Preserves: status, priority, assignee, labels, estimates, team info</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {previewIssues.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-auto">
              <div className="flex items-center gap-2">
                <Label>Preview ({previewIssues.length} issues)</Label>
                <Badge variant="secondary">{previewIssues.length}</Badge>
              </div>
              <div className="space-y-1 text-sm bg-muted rounded p-3">
                {previewIssues.slice(0, 5).map((issue, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{issue.id}</span>
                    <span className="truncate">{issue.title}</span>
                    <Badge variant="outline" className="text-xs">{issue.projectId}</Badge>
                  </div>
                ))}
                {previewIssues.length > 5 && (
                  <div className="text-xs text-muted-foreground">
                    ...and {previewIssues.length - 5} more
                  </div>
                )}
              </div>
            </div>
          )}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => {
            const blob = new Blob([sampleMarkdown], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sample-import.md';
            a.click();
            URL.revokeObjectURL(url);
          }}>
            <Download className="w-4 h-4 mr-2" />
            Download Sample Markdown
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={previewIssues.length === 0}
            >
              Import {previewIssues.length} Issues
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}