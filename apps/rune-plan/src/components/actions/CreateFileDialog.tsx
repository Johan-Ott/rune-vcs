import React, { useState } from 'react';
import { FolderPlus, FilePlus, FileText, FileCode, FileImage, Folder } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface FileTemplate {
  id: string;
  name: string;
  extension: string;
  icon: React.ReactNode;
  content: string;
  description: string;
}

interface CreateFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPath: string;
  onCreateFile: (path: string, content: string) => void;
  onCreateFolder: (path: string) => void;
}

const fileTemplates: FileTemplate[] = [
  {
    id: 'text',
    name: 'Text File',
    extension: 'txt',
    icon: <FileText className="w-4 h-4" />,
    content: '',
    description: 'Plain text file'
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    extension: 'ts',
    icon: <FileCode className="w-4 h-4" />,
    content: `// TypeScript file
export default class Example {
  constructor() {
    console.log('Hello, TypeScript!');
  }
}`,
    description: 'TypeScript source file'
  },
  {
    id: 'react',
    name: 'React Component',
    extension: 'tsx',
    icon: <FileCode className="w-4 h-4" />,
    content: `import React from 'react';

interface Props {
  // Define your props here
}

export const Component: React.FC<Props> = () => {
  return (
    <div>
      <h1>Hello, React!</h1>
    </div>
  );
};

export default Component;`,
    description: 'React TypeScript component'
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    extension: 'js',
    icon: <FileCode className="w-4 h-4" />,
    content: `// JavaScript file
function hello() {
  console.log('Hello, JavaScript!');
}

export default hello;`,
    description: 'JavaScript source file'
  },
  {
    id: 'css',
    name: 'CSS Stylesheet',
    extension: 'css',
    icon: <FileText className="w-4 h-4" />,
    content: `/* CSS Stylesheet */
.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}`,
    description: 'Cascading Style Sheet'
  },
  {
    id: 'json',
    name: 'JSON Data',
    extension: 'json',
    icon: <FileText className="w-4 h-4" />,
    content: `{
  "name": "example",
  "version": "1.0.0",
  "description": "Example JSON file"
}`,
    description: 'JSON data file'
  },
  {
    id: 'markdown',
    name: 'Markdown',
    extension: 'md',
    icon: <FileText className="w-4 h-4" />,
    content: `# Title

## Description

Write your markdown content here...

- List item 1
- List item 2
- List item 3

\`\`\`typescript
// Code example
console.log('Hello, World!');
\`\`\``,
    description: 'Markdown document'
  }
];

export const CreateFileDialog: React.FC<CreateFileDialogProps> = ({
  open,
  onOpenChange,
  currentPath,
  onCreateFile,
  onCreateFolder,
}) => {
  const [activeTab, setActiveTab] = useState('file');
  const [fileName, setFileName] = useState('');
  const [folderName, setFolderName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<FileTemplate | null>(null);
  const [customExtension, setCustomExtension] = useState('');

  const handleCreateFile = () => {
    if (!fileName) return;

    let finalFileName = fileName;
    let content = '';

    if (selectedTemplate) {
      // Add extension if not already present
      if (!fileName.includes('.')) {
        finalFileName = `${fileName}.${selectedTemplate.extension}`;
      }
      content = selectedTemplate.content;
    } else if (customExtension && !fileName.includes('.')) {
      finalFileName = `${fileName}.${customExtension}`;
    }

    const filePath = `${currentPath}/${finalFileName}`;
    onCreateFile(filePath, content);
    
    // Reset form
    setFileName('');
    setSelectedTemplate(null);
    setCustomExtension('');
    onOpenChange(false);
  };

  const handleCreateFolder = () => {
    if (!folderName) return;

    const folderPath = `${currentPath}/${folderName}`;
    onCreateFolder(folderPath);
    
    // Reset form
    setFolderName('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Item</DialogTitle>
          <DialogDescription>
            Create a new file or folder in {currentPath}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file" className="flex items-center gap-2">
              <FilePlus className="w-4 h-4" />
              File
            </TabsTrigger>
            <TabsTrigger value="folder" className="flex items-center gap-2">
              <FolderPlus className="w-4 h-4" />
              Folder
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fileName">File Name</Label>
              <Input
                id="fileName"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter file name..."
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label>Template</Label>
              <Select
                value={selectedTemplate?.id || ''}
                onValueChange={(value) => {
                  const template = fileTemplates.find(t => t.id === value);
                  setSelectedTemplate(template || null);
                  setCustomExtension('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No template</SelectItem>
                  {fileTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        {template.icon}
                        <span>{template.name}</span>
                        <span className="text-xs text-muted-foreground">
                          .{template.extension}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTemplate && (
                <p className="text-xs text-muted-foreground">
                  {selectedTemplate.description}
                </p>
              )}
            </div>

            {!selectedTemplate && (
              <div className="space-y-2">
                <Label htmlFor="extension">Custom Extension (optional)</Label>
                <Input
                  id="extension"
                  value={customExtension}
                  onChange={(e) => setCustomExtension(e.target.value)}
                  placeholder="e.g., txt, js, py..."
                />
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFile} disabled={!fileName}>
                Create File
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="folder" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">Folder Name</Label>
              <Input
                id="folderName"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter folder name..."
                autoFocus
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Folder className="w-4 h-4" />
              <span>New folder will be created in: {currentPath}</span>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFolder} disabled={!folderName}>
                Create Folder
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
