import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { TrendingUp, TrendingDown, Users, Target, Clock, CheckCircle } from 'lucide-react';
import { Issue, Project, Team, Goal } from '../App';

interface AnalyticsViewProps {
  issues: Issue[];
  projects: Project[];
  teams: Team[];
  goals: Goal[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

export function AnalyticsView({ issues, projects, teams, goals }: AnalyticsViewProps) {
  // Calculate metrics
  const totalIssues = issues.length;
  const completedIssues = issues.filter(issue => issue.status === 'done').length;
  const inProgressIssues = issues.filter(issue => issue.status === 'in-progress').length;
  const todoIssues = issues.filter(issue => issue.status === 'todo').length;
  const backlogIssues = issues.filter(issue => issue.status === 'backlog').length;
  const completionRate = totalIssues > 0 ? (completedIssues / totalIssues) * 100 : 0;

  // Issues by status for pie chart
  const statusData = [
    { name: 'Done', value: completedIssues, color: '#22c55e' },
    { name: 'In Progress', value: inProgressIssues, color: '#3b82f6' },
    { name: 'Todo', value: todoIssues, color: '#f59e0b' },
    { name: 'Backlog', value: backlogIssues, color: '#6b7280' },
  ];

  // Issues by project
  const projectData = projects.map(project => ({
    name: project.name,
    total: issues.filter(issue => issue.project === project.name).length,
    completed: issues.filter(issue => issue.project === project.name && issue.status === 'done').length,
    inProgress: issues.filter(issue => issue.project === project.name && issue.status === 'in-progress').length,
  }));

  // Issues by priority
  const priorityData = [
    { name: 'Critical', value: issues.filter(issue => issue.priority === 'critical').length },
    { name: 'Urgent', value: issues.filter(issue => issue.priority === 'urgent').length },
    { name: 'High', value: issues.filter(issue => issue.priority === 'high').length },
    { name: 'Medium', value: issues.filter(issue => issue.priority === 'medium').length },
    { name: 'Low', value: issues.filter(issue => issue.priority === 'low').length },
    { name: 'Lowest', value: issues.filter(issue => issue.priority === 'lowest').length },
  ].filter(item => item.value > 0);

  // Team productivity (issues per team member)
  const teamProductivity = teams.map(team => {
    const teamIssues = issues.filter(issue => 
      team.members?.some(member => member.name === issue.assignee?.name)
    );
    return {
      name: team.name,
      totalIssues: teamIssues.length,
      completedIssues: teamIssues.filter(issue => issue.status === 'done').length,
      members: team.members?.length || 0,
      productivity: team.members?.length ? teamIssues.length / team.members.length : 0,
    };
  });

  // Velocity data (mock monthly data)
  const velocityData = [
    { month: 'Oct', completed: 15, planned: 20 },
    { month: 'Nov', completed: 22, planned: 25 },
    { month: 'Dec', completed: 28, planned: 30 },
    { month: 'Jan', completed: 18, planned: 22 },
  ];

  // Goals progress
  const goalsProgress = goals.map(goal => ({
    ...goal,
    progress: goal.issuesCount > 0 ? (goal.completedIssuesCount / goal.issuesCount) * 100 : 0,
  }));

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="space-y-2">
        <h1>Analytics</h1>
        <p className="text-muted-foreground">
          Track progress, performance, and insights across your projects and teams.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="velocity">Velocity</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalIssues}</div>
                <p className="text-xs text-muted-foreground">
                  Across all projects
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{completedIssues}</div>
                <p className="text-xs text-muted-foreground">
                  {completionRate.toFixed(1)}% completion rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">{inProgressIssues}</div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {teams.reduce((acc, team) => acc + (team.members?.length || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across {teams.length} teams
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Issues by Status</CardTitle>
                <CardDescription>Distribution of issue statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Issues by Priority</CardTitle>
                <CardDescription>Priority distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Progress</CardTitle>
              <CardDescription>Issue completion across projects</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={projectData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" stackId="a" fill="#22c55e" name="Completed" />
                  <Bar dataKey="inProgress" stackId="a" fill="#3b82f6" name="In Progress" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {projects.map((project) => (
              <Card key={project.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {project.completedCount}/{project.issueCount} issues
                        </p>
                        <Progress 
                          value={(project.completedCount / Math.max(project.issueCount, 1)) * 100} 
                          className="w-32" 
                        />
                      </div>
                      <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="teams" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Productivity</CardTitle>
              <CardDescription>Issues per team member</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={teamProductivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="productivity" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {teams.map((team) => (
              <Card key={team.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={team.avatar} />
                        <AvatarFallback>{team.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{team.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {team.members?.length || 0} members
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {issues.filter(issue => 
                          team.members?.some(member => member.name === issue.assignee?.name)
                        ).length} issues
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="velocity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Velocity</CardTitle>
              <CardDescription>Planned vs completed issues over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={velocityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="planned"
                    stackId="1"
                    stroke="#94a3b8"
                    fill="#94a3b8"
                    fillOpacity={0.6}
                    name="Planned"
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stackId="2"
                    stroke="#22c55e"
                    fill="#22c55e"
                    name="Completed"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Velocity</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">21.3</div>
                <p className="text-xs text-green-500">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Velocity Trend</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+8%</div>
                <p className="text-xs text-green-500">Improving over time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Predictability</CardTitle>
                <Target className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-xs text-muted-foreground">Planning accuracy</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="grid gap-4">
            {goalsProgress.map((goal) => (
              <Card key={goal.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium">{goal.title}</h3>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      </div>
                      <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                        {goal.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{goal.completedIssuesCount}/{goal.issuesCount} issues</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>

                    {goal.targetDate && (
                      <p className="text-sm text-muted-foreground">
                        Target date: {new Date(goal.targetDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Goals Progress Overview</CardTitle>
              <CardDescription>Completion status of all goals</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={goalsProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="title" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="progress" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}