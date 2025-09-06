// This file is no longer needed - content moved to IssuesView.tsx

interface IssuesViewProps {
  issues: Issue[];
  selectedIssue: Issue | null;
  onIssueSelect: (issue: Issue) => void;
  onIssueCreate?: (issue: Issue) => void;
  onIssueUpdate?: (issue: Issue) => void;
  onIssueDelete?: (issueId: string) => void;
  onIssueStatusChange?: (issueId: string, status: Issue['status']) => void;
  onProjectCreate?: (project: any) => void;
}

export function IssuesView({ 
  issues, 
  selectedIssue, 
  onIssueSelect,
  onIssueCreate,
  onIssueUpdate,
  onIssueDelete,
  onIssueStatusChange,
  onProjectCreate
}: IssuesViewProps) {
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    priority: 'medium' as Issue['priority'],
    project: '',
    labels: [] as string[],
    assignee: '',
    status: 'todo' as Issue['status']
  });
  const [newProject, setNewProject] = useState({
    name: '',
    description: ''
  });
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [availableTags, setAvailableTags] = useState([
    'Bug', 'Feature', 'Enhancement', 'Documentation', 'Testing', 
    'Backend', 'Frontend', 'Mobile', 'Design', 'Security', 
    'Performance', 'API', 'Database', 'UI', 'UX', 'Analytics',
    'Authentication', 'Components', 'CSS', 'JavaScript', 'React'
  ]);
  const [newTag, setNewTag] = useState('');
  const [availableStatus, setAvailableStatus] = useState([
    'backlog', 'todo', 'in-progress', 'done', 'cancelled'
  ]);
  const [availablePriorities, setAvailablePriorities] = useState([
    'lowest', 'low', 'medium', 'high', 'urgent', 'critical'
  ]);
  const [newStatus, setNewStatus] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [editingField, setEditingField] = useState<{issueId: string, field: string} | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [newComment, setNewComment] = useState('');
  const [editingLabels, setEditingLabels] = useState<string | null>(null);
  const [tempTag, setTempTag] = useState('');

  const getStatusIcon = (status: Issue['status']) => {
    switch (status) {
      case 'todo':
        return <Circle className="w-4 h-4 text-muted-foreground" />;
      case 'backlog':
        return <Minus className="w-4 h-4 text-muted-foreground" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'done':
        return <CheckCircle2 className="w-4 h-4 text-green-500" fill="currentColor" />;
      case 'cancelled':
        return <Ban className="w-4 h-4 text-red-500" />;
    }
  };

  const getPriorityIcon = (priority: Issue['priority']) => {
    switch (priority) {
      case 'critical':
        return <AlertCircle className="w-3 h-3 text-red-600" fill="currentColor" />;
      case 'urgent':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      case 'high':
        return <ArrowRight className="w-3 h-3 text-orange-500 rotate-45" />;
      case 'medium':
        return <ArrowRight className="w-3 h-3 text-yellow-500" />;
      case 'low':
        return <ArrowRight className="w-3 h-3 text-green-500 -rotate-45" />;
      case 'lowest':
        return <ArrowRight className="w-3 h-3 text-gray-400 -rotate-90" />;
    }
  };

  const getPriorityColor = (priority: Issue['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-600/10 text-red-800 dark:text-red-300';
      case 'urgent':
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
      case 'high':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'low':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'lowest':
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: Issue['status']) => {
    switch (status) {
      case 'todo':
        return 'bg-muted text-muted-foreground';
      case 'backlog':
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
      case 'in-progress':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'done':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleCreateIssue = () => {
    if (newIssue.title.trim() && onIssueCreate) {
      const issue: Issue = {
        id: `RUN-${Date.now()}`,
        title: newIssue.title,
        description: newIssue.description,
        status: newIssue.status,
        priority: newIssue.priority,
        project: newIssue.project || 'Core Platform',
        labels: newIssue.labels,
        assignee: (newIssue.assignee && newIssue.assignee !== "unassigned") ? {
          name: newIssue.assignee,
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b734?w=32&h=32&fit=crop&crop=face'
        } : undefined,
        subIssues: [],
        activity: []
      };
      onIssueCreate(issue);
      setNewIssue({
        title: '',
        description: '',
        priority: 'medium',
        project: '',
        labels: [],
        assignee: '',
        status: 'todo'
      });
      setShowCreateForm(false);
    }
  };

  const handleCreateProject = () => {
    if (newProject.name.trim() && onProjectCreate) {
      const project = {
        id: newProject.name.toLowerCase().replace(/\s+/g, '-'),
        name: newProject.name,
        description: newProject.description,
        status: 'active',
        issueCount: 0,
        completedCount: 0,
        members: []
      };
      onProjectCreate(project);
      setNewProject({ name: '', description: '' });
      setShowNewProjectForm(false);
      // Set the new project as selected
      setNewIssue(prev => ({ ...prev, project: newProject.name }));
    }
  };

  const handleAddTag = (tag: string) => {
    if (tag && !newIssue.labels.includes(tag)) {
      setNewIssue(prev => ({
        ...prev,
        labels: [...prev.labels, tag]
      }));
      // Add to available tags if it's new
      if (!availableTags.includes(tag)) {
        setAvailableTags(prev => [...prev, tag]);
      }
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewIssue(prev => ({
      ...prev,
      labels: prev.labels.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddTagToIssue = (issue: Issue, tag: string) => {
    if (!tag || issue.labels.includes(tag)) return;
    
    const updatedIssue = {
      ...issue,
      labels: [...issue.labels, tag]
    };
    if (onIssueUpdate) {
      onIssueUpdate(updatedIssue);
    }
    // Add to available tags if it's new
    if (!availableTags.includes(tag)) {
      setAvailableTags(prev => [...prev, tag]);
    }
  };

  const handleRemoveTagFromIssue = (issue: Issue, tagToRemove: string) => {
    const updatedIssue = {
      ...issue,
      labels: issue.labels.filter(tag => tag !== tagToRemove)
    };
    if (onIssueUpdate) {
      onIssueUpdate(updatedIssue);
    }
  };

  const handleAddNewStatus = () => {
    if (newStatus && !availableStatus.includes(newStatus as any)) {
      setAvailableStatus(prev => [...prev, newStatus]);
      setNewStatus('');
    }
  };

  const handleAddNewPriority = () => {
    if (newPriority && !availablePriorities.includes(newPriority as any)) {
      setAvailablePriorities(prev => [...prev, newPriority]);
      setNewPriority('');
    }
  };

  const handleIssueExpand = (issueId: string) => {
    setExpandedIssue(expandedIssue === issueId ? null : issueId);
    setEditingField(null);
    setTempValue('');
    setEditingLabels(null);
  };

  const handleFieldEdit = (issueId: string, field: string, currentValue: string) => {
    setEditingField({ issueId, field });
    setTempValue(currentValue);
  };

  const handleFieldSave = (issue: Issue) => {
    if (!editingField || !onIssueUpdate) return;

    const updatedIssue = { ...issue };
    
    switch (editingField.field) {
      case 'title':
        updatedIssue.title = tempValue;
        break;
      case 'description':
        updatedIssue.description = tempValue;
        break;
    }

    onIssueUpdate(updatedIssue);
    setEditingField(null);
    setTempValue('');
  };

  const handleFieldCancel = () => {
    setEditingField(null);
    setTempValue('');
  };

  const handleSelectChange = (issue: Issue, field: string, value: any) => {
    if (!onIssueUpdate) return;

    const updatedIssue = { ...issue };
    
    switch (field) {
      case 'status':
        updatedIssue.status = value;
        break;
      case 'priority':
        updatedIssue.priority = value;
        break;
      case 'project':
        updatedIssue.project = value;
        break;
      case 'assignee':
        updatedIssue.assignee = value === "unassigned" ? undefined : {
          name: value,
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b734?w=32&h=32&fit=crop&crop=face'
        };
        break;
    }

    onIssueUpdate(updatedIssue);
  };

  const handleStatusChange = (issue: Issue, newStatus: Issue['status']) => {
    if (onIssueStatusChange) {
      onIssueStatusChange(issue.id, newStatus);
    }
  };

  const handleAddComment = (issue: Issue) => {
    if (newComment.trim()) {
      const activity: ActivityItem = {
        id: Date.now().toString(),
        type: 'comment',
        user: 'Current User',
        content: newComment,
        timestamp: 'now'
      };
      
      const updatedIssue = {
        ...issue,
        activity: [...issue.activity, activity]
      };
      
      if (onIssueUpdate) {
        onIssueUpdate(updatedIssue);
      }
      setNewComment('');
    }
  };

  // Get unique values for dropdowns
  const projects = Array.from(new Set(issues.map(i => i.project)));
  const assignees = Array.from(new Set(issues.filter(i => i.assignee).map(i => i.assignee!.name)));

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Issues</h2>
          <p className="text-sm text-muted-foreground">
            Manage and track all your issues in one place
          </p>
        </div>

        <div className="space-y-3">
          {/* Create Issue Section */}
          <Card className="border-dashed border-2">
            <CardHeader 
              className="cursor-pointer hover:bg-muted/50 transition-colors p-4"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Create new issue</h3>
                    <p className="text-sm text-muted-foreground">Add a new task or bug report</p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: showCreateForm ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </motion.div>
              </div>
            </CardHeader>
            
            <AnimatePresence>
              {showCreateForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <CardContent className="pt-0 pb-4">
                    <Separator className="mb-4" />
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="issue-title">Title*</Label>
                        <Input
                          id="issue-title"
                          placeholder="What needs to be done?"
                          value={newIssue.title}
                          onChange={(e) => setNewIssue(prev => ({ ...prev, title: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="issue-description">Description</Label>
                        <Textarea
                          id="issue-description"
                          placeholder="Add more details..."
                          value={newIssue.description}
                          onChange={(e) => setNewIssue(prev => ({ ...prev, description: e.target.value }))}
                          className="mt-1"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor="issue-status">Status</Label>
                          <Select
                            value={newIssue.status}
                            onValueChange={(value: Issue['status']) => 
                              setNewIssue(prev => ({ ...prev, status: value }))
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableStatus.map(status => (
                                <SelectItem key={status} value={status}>
                                  {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                                </SelectItem>
                              ))}
                              <Separator className="my-1" />
                              <div className="p-2">
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="New status..."
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="h-8 text-xs"
                                  />
                                  <Button 
                                    size="sm" 
                                    onClick={handleAddNewStatus}
                                    disabled={!newStatus.trim()}
                                    className="h-8 px-3 text-xs"
                                  >
                                    Add
                                  </Button>
                                </div>
                              </div>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="issue-priority">Priority</Label>
                          <Select
                            value={newIssue.priority}
                            onValueChange={(value: Issue['priority']) => 
                              setNewIssue(prev => ({ ...prev, priority: value }))
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availablePriorities.map(priority => (
                                <SelectItem key={priority} value={priority}>
                                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                </SelectItem>
                              ))}
                              <Separator className="my-1" />
                              <div className="p-2">
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="New priority..."
                                    value={newPriority}
                                    onChange={(e) => setNewPriority(e.target.value)}
                                    className="h-8 text-xs"
                                  />
                                  <Button 
                                    size="sm" 
                                    onClick={handleAddNewPriority}
                                    disabled={!newPriority.trim()}
                                    className="h-8 px-3 text-xs"
                                  >
                                    Add
                                  </Button>
                                </div>
                              </div>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="issue-project">Project</Label>
                          <Select
                            value={newIssue.project}
                            onValueChange={(value) => 
                              setNewIssue(prev => ({ ...prev, project: value }))
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select project" />
                            </SelectTrigger>
                            <SelectContent>
                              {projects.map(project => (
                                <SelectItem key={project} value={project}>{project}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="issue-assignee">Assignee</Label>
                          <Select
                            value={newIssue.assignee || "unassigned"}
                            onValueChange={(value) => 
                              setNewIssue(prev => ({ ...prev, assignee: value === "unassigned" ? "" : value }))
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Unassigned" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">Unassigned</SelectItem>
                              {assignees.map(assignee => (
                                <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Tags Section */}
                      <div>
                        <Label htmlFor="issue-tags">Tags</Label>
                        <div className="mt-1 space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add a tag..."
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddTag(newTag);
                                }
                              }}
                              className="flex-1"
                            />
                            <Button 
                              type="button"
                              variant="outline" 
                              size="sm"
                              onClick={() => handleAddTag(newTag)}
                              disabled={!newTag.trim()}
                            >
                              Add
                            </Button>
                          </div>
                          
                          {/* Suggested Tags */}
                          <div className="flex flex-wrap gap-1">
                            {availableTags.filter(tag => !newIssue.labels.includes(tag)).slice(0, 8).map(tag => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="cursor-pointer hover:bg-muted text-xs"
                                onClick={() => handleAddTag(tag)}
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          {/* Selected Tags */}
                          {newIssue.labels.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {newIssue.labels.map(tag => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs flex items-center gap-1"
                                >
                                  <Tag className="w-3 h-3" />
                                  {tag}
                                  <X 
                                    className="w-3 h-3 cursor-pointer hover:text-destructive" 
                                    onClick={() => handleRemoveTag(tag)}
                                  />
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          onClick={handleCreateIssue} 
                          disabled={!newIssue.title.trim()}
                          size="sm"
                        >
                          Create issue
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setShowCreateForm(false);
                            setNewIssue({
                              title: '',
                              description: '',
                              priority: 'medium',
                              project: '',
                              labels: [],
                              assignee: '',
                              status: 'todo'
                            });
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Issues List */}
          {issues.map((issue) => (
            <Card key={issue.id} className="overflow-hidden group">
              <CardHeader 
                className="cursor-pointer hover:bg-muted/50 transition-all duration-200 p-3 py-2"
                onClick={() => handleIssueExpand(issue.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div 
                      className="cursor-pointer hover:scale-110 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(issue, 
                          issue.status === 'todo' ? 'in-progress' : 
                          issue.status === 'backlog' ? 'todo' :
                          issue.status === 'in-progress' ? 'done' : 
                          issue.status === 'done' ? 'todo' :
                          issue.status === 'cancelled' ? 'todo' : 'todo'
                        );
                      }}
                    >
                      {getStatusIcon(issue.status)}
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xs text-muted-foreground font-mono flex-shrink-0">{issue.id}</span>
                      <span className="text-sm truncate">{issue.title}</span>
                    </div>
                    
                    {/* Hover Information */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Badge 
                        variant="secondary" 
                        className={cn("text-xs flex items-center gap-1", getPriorityColor(issue.priority))}
                      >
                        {getPriorityIcon(issue.priority)}
                        {issue.priority}
                      </Badge>
                      
                      {/* Show first few tags on hover */}
                      {issue.labels.slice(0, 2).map(label => (
                        <Badge key={label} variant="outline" className="text-xs">
                          {label}
                        </Badge>
                      ))}
                      {issue.labels.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{issue.labels.length - 2}
                        </Badge>
                      )}
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <FolderOpen className="w-3 h-3" />
                        <span>{issue.project}</span>
                      </div>
                      {issue.assignee && (
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={issue.assignee.avatar} alt={issue.assignee.name} />
                          <AvatarFallback className="text-xs">
                            {issue.assignee.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      {issue.dueDate && (
                        <span className="text-xs text-muted-foreground">
                          {formatDate(issue.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-2">
                    {issue.activity.length > 0 && (
                      <div className="flex items-center gap-1 text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity">
                        <MessageSquare className="w-3 h-3" />
                        <span className="text-xs">{issue.activity.length}</span>
                      </div>
                    )}
                    <motion.div
                      animate={{ rotate: expandedIssue === issue.id ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="opacity-60 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </motion.div>
                  </div>
                </div>
              </CardHeader>
              
              <AnimatePresence>
                {expandedIssue === issue.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <CardContent className="pt-0 pb-4">
                      <Separator className="mb-4" />
                      
                      {/* Issue Details Section */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium">Issue Details</h4>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => onIssueDelete?.(issue.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                        
                        <div className="space-y-4">
                          {/* Inline Title Edit */}
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Title</div>
                            {editingField?.issueId === issue.id && editingField?.field === 'title' ? (
                              <div className="flex gap-2">
                                <Input
                                  value={tempValue}
                                  onChange={(e) => setTempValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleFieldSave(issue);
                                    if (e.key === 'Escape') handleFieldCancel();
                                  }}
                                  onBlur={() => handleFieldSave(issue)}
                                  className="flex-1"
                                  autoFocus
                                />
                              </div>
                            ) : (
                              <div 
                                className="text-sm p-2 rounded hover:bg-muted/50 cursor-pointer transition-colors"
                                onClick={() => handleFieldEdit(issue.id, 'title', issue.title)}
                              >
                                {issue.title}
                              </div>
                            )}
                          </div>

                          {/* Inline Description Edit */}
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Description</div>
                            {editingField?.issueId === issue.id && editingField?.field === 'description' ? (
                              <Textarea
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Escape') handleFieldCancel();
                                }}
                                onBlur={() => handleFieldSave(issue)}
                                rows={3}
                                autoFocus
                              />
                            ) : (
                              <div 
                                className="text-sm p-2 rounded hover:bg-muted/50 cursor-pointer transition-colors min-h-[2.5rem] flex items-center"
                                onClick={() => handleFieldEdit(issue.id, 'description', issue.description || '')}
                              >
                                {issue.description || (
                                  <span className="text-muted-foreground italic">Click to add description...</span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Properties Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <div className="text-sm text-muted-foreground mb-1">Status</div>
                              <Select
                                value={issue.status}
                                onValueChange={(value: Issue['status']) => 
                                  handleSelectChange(issue, 'status', value)
                                }
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableStatus.map(status => (
                                    <SelectItem key={status} value={status}>
                                      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground mb-1">Priority</div>
                              <Select
                                value={issue.priority}
                                onValueChange={(value: Issue['priority']) => 
                                  handleSelectChange(issue, 'priority', value)
                                }
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {availablePriorities.map(priority => (
                                    <SelectItem key={priority} value={priority}>
                                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground mb-1">Project</div>
                              <Select
                                value={issue.project}
                                onValueChange={(value) => 
                                  handleSelectChange(issue, 'project', value)
                                }
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {projects.map(project => (
                                    <SelectItem key={project} value={project}>{project}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground mb-1">Assignee</div>
                              <Select
                                value={issue.assignee?.name || "unassigned"}
                                onValueChange={(value) => 
                                  handleSelectChange(issue, 'assignee', value)
                                }
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="unassigned">Unassigned</SelectItem>
                                  {assignees.map(assignee => (
                                    <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Labels Section */}
                          <div>
                            <div className="text-sm text-muted-foreground mb-2">Labels</div>
                            {editingLabels === issue.id ? (
                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Add label..."
                                    value={tempTag}
                                    onChange={(e) => setTempTag(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (tempTag.trim()) {
                                          handleAddTagToIssue(issue, tempTag.trim());
                                          setTempTag('');
                                        }
                                      }
                                      if (e.key === 'Escape') {
                                        setEditingLabels(null);
                                        setTempTag('');
                                      }
                                    }}
                                    className="flex-1 h-8"
                                    autoFocus
                                  />
                                  <Button 
                                    size="sm"
                                    onClick={() => {
                                      if (tempTag.trim()) {
                                        handleAddTagToIssue(issue, tempTag.trim());
                                        setTempTag('');
                                      }
                                    }}
                                    disabled={!tempTag.trim()}
                                    className="h-8"
                                  >
                                    Add
                                  </Button>
                                  <Button 
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingLabels(null);
                                      setTempTag('');
                                    }}
                                    className="h-8"
                                  >
                                    Done
                                  </Button>
                                </div>
                                
                                {/* Available tags to choose from */}
                                <div className="flex flex-wrap gap-1">
                                  {availableTags.filter(tag => !issue.labels.includes(tag)).slice(0, 8).map(tag => (
                                    <Badge
                                      key={tag}
                                      variant="outline"
                                      className="cursor-pointer hover:bg-muted text-xs"
                                      onClick={() => handleAddTagToIssue(issue, tag)}
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-1 min-h-[2rem] items-center">
                                {issue.labels.map(label => (
                                  <Badge 
                                    key={label} 
                                    variant="secondary" 
                                    className="text-xs flex items-center gap-1 group"
                                  >
                                    <Tag className="w-3 h-3" />
                                    {label}
                                    <X 
                                      className="w-3 h-3 cursor-pointer hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" 
                                      onClick={() => handleRemoveTagFromIssue(issue, label)}
                                    />
                                  </Badge>
                                ))}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingLabels(issue.id)}
                                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add label
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Activity Section */}
                      <div>
                        <h4 className="font-medium mb-3">Activity</h4>
                        <div className="space-y-3">
                          {issue.activity.map((activity) => (
                            <div key={activity.id} className="flex gap-3 p-2 rounded-lg bg-muted/30">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs">
                                  {activity.user.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                  <span className="font-medium">{activity.user}</span>
                                  <span>{activity.timestamp}</span>
                                </div>
                                <p className="text-sm">{activity.content}</p>
                              </div>
                            </div>
                          ))}
                          
                          {/* Add Comment */}
                          <div className="flex gap-2">
                            <Textarea
                              placeholder="Add a comment..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              rows={2}
                              className="flex-1"
                            />
                            <Button 
                              size="sm"
                              onClick={() => handleAddComment(issue)}
                              disabled={!newComment.trim()}
                            >
                              Comment
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}