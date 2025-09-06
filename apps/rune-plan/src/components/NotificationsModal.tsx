import React, { useState } from 'react';
import { Bell, Check, X, Clock, User, MessageSquare, GitPullRequest, Settings, Archive } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { ExpandableRow, ExpandableRowContent } from './ExpandableRow';
import { cn } from './ui/utils';

interface NotificationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNotificationCountChange?: (count: number) => void;
}

interface Notification {
  id: string;
  type: 'mention' | 'assignment' | 'comment' | 'status_change' | 'deadline' | 'release';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  actor?: {
    name: string;
    avatar: string;
  };
  issue?: {
    id: string;
    title: string;
  };
  project?: string;
  priority?: 'low' | 'medium' | 'high';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'mention',
    title: 'You were mentioned in a comment',
    description: 'Alice Johnson mentioned you in RUN-123: "Can you review this implementation?"',
    timestamp: '2 minutes ago',
    read: false,
    actor: {
      name: 'Alice Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b734?w=32&h=32&fit=crop&crop=face'
    },
    issue: {
      id: 'RUN-123',
      title: 'Implement user authentication'
    },
    project: 'Core Platform',
    priority: 'high'
  },
  {
    id: '2',
    type: 'assignment',
    title: 'New issue assigned to you',
    description: 'Bob Smith assigned RUN-456 to you',
    timestamp: '1 hour ago',
    read: false,
    actor: {
      name: 'Bob Smith',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
    },
    issue: {
      id: 'RUN-456',
      title: 'Design mobile navigation'
    },
    project: 'Mobile App',
    priority: 'medium'
  },
  {
    id: '3',
    type: 'status_change',
    title: 'Issue status updated',
    description: 'RUN-789 was moved to "In Progress"',
    timestamp: '3 hours ago',
    read: true,
    issue: {
      id: 'RUN-789',
      title: 'Fix payment gateway bug'
    },
    project: 'Core Platform',
    priority: 'high'
  },
  {
    id: '4',
    type: 'deadline',
    title: 'Deadline approaching',
    description: 'RUN-101 is due tomorrow',
    timestamp: '5 hours ago',
    read: false,
    issue: {
      id: 'RUN-101',
      title: 'Update documentation'
    },
    project: 'Documentation',
    priority: 'low'
  },
  {
    id: '5',
    type: 'comment',
    title: 'New comment on your issue',
    description: 'Charlie Davis commented on RUN-202',
    timestamp: '1 day ago',
    read: true,
    actor: {
      name: 'Charlie Davis',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
    },
    issue: {
      id: 'RUN-202',
      title: 'Optimize database queries'
    },
    project: 'Backend',
    priority: 'medium'
  },
  {
    id: '6',
    type: 'release',
    title: 'New release deployed',
    description: 'Version 1.0.2 has been deployed to production',
    timestamp: '2 days ago',
    read: true,
    project: 'Core Platform',
    priority: 'medium'
  }
];

export function NotificationsModal({ open, onOpenChange, onNotificationCountChange }: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      );
      const newUnreadCount = updated.filter(n => !n.read).length;
      onNotificationCountChange?.(newUnreadCount);
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    onNotificationCountChange?.(0);
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      const newUnreadCount = updated.filter(n => !n.read).length;
      onNotificationCountChange?.(newUnreadCount);
      return updated;
    });
  };

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'mentions':
        return notifications.filter(n => n.type === 'mention');
      case 'assignments':
        return notifications.filter(n => n.type === 'assignment');
      default:
        return notifications;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'mention': return MessageSquare;
      case 'assignment': return User;
      case 'comment': return MessageSquare;
      case 'status_change': return GitPullRequest;
      case 'deadline': return Clock;
      case 'release': return Settings;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'mention': return 'text-blue-400';
      case 'assignment': return 'text-green-400';
      case 'comment': return 'text-purple-400';
      case 'status_change': return 'text-orange-400';
      case 'deadline': return 'text-red-400';
      case 'release': return 'text-indigo-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {unreadCount} new
                </Badge>
              )}
            </DialogTitle>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
              >
                <Check className="w-4 h-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </TabsTrigger>
            <TabsTrigger value="mentions">Mentions</TabsTrigger>
            <TabsTrigger value="assignments">Assigned</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-2">No notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    {activeTab === 'all' 
                      ? "You're all caught up!"
                      : `No ${activeTab} notifications`
                    }
                  </p>
                </div>
              ) : (
                <div className="border border-border/50 rounded-lg overflow-hidden">
                  {filteredNotifications.map((notification) => {
                    const IconComponent = getNotificationIcon(notification.type);
                    
                    return (
                      <ExpandableRow
                        key={notification.id}
                        className={cn(
                          "transition-all",
                          !notification.read && "bg-blue-500/5 border-l-2 border-l-blue-500"
                        )}
                        expandedContent={
                          <div className="space-y-4">
                            <div className="text-sm text-muted-foreground">
                              {notification.description}
                            </div>
                            
                            {notification.issue && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Issue:</span>
                                <Badge variant="outline" className="font-mono">
                                  {notification.issue.id}
                                </Badge>
                                <span>{notification.issue.title}</span>
                              </div>
                            )}
                            
                            {notification.project && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Project:</span>
                                <span>{notification.project}</span>
                                {notification.priority && (
                                  <Badge className={getPriorityColor(notification.priority)}>
                                    {notification.priority}
                                  </Badge>
                                )}
                              </div>
                            )}

                            <div className="flex gap-2">
                              {!notification.read && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  Mark as read
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <Archive className="w-4 h-4 mr-2" />
                                Archive
                              </Button>
                            </div>
                          </div>
                        }
                      >
                        <ExpandableRowContent
                          avatar={
                            notification.actor ? (
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={notification.actor.avatar} />
                                <AvatarFallback>
                                  <User className="w-4 h-4" />
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <IconComponent className={cn("w-4 h-4", getNotificationColor(notification.type))} />
                              </div>
                            )
                          }
                          title={
                            <div className="flex items-center gap-2">
                              <span className={cn(!notification.read && "font-medium")}>
                                {notification.title}
                              </span>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                          }
                          subtitle={notification.timestamp}
                          actions={[
                            !notification.read && (
                              <Button
                                key="read"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="h-6 px-2"
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                            ),
                            <Button
                              key="delete"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="h-6 px-2"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          ].filter(Boolean)}
                        />
                      </ExpandableRow>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}