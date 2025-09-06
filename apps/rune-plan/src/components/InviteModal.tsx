import React, { useState } from 'react';
import { UserPlus, Mail, Copy, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';

interface InviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Invite {
  email: string;
  role: 'admin' | 'member' | 'viewer';
}

export function InviteModal({ open, onOpenChange }: InviteModalProps) {
  const [invites, setInvites] = useState<Invite[]>([{ email: '', role: 'member' }]);
  const [message, setMessage] = useState('Join our team on Rune-Plan to collaborate on issues and projects.');
  const [copied, setCopied] = useState(false);

  const addInvite = () => {
    setInvites([...invites, { email: '', role: 'member' }]);
  };

  const removeInvite = (index: number) => {
    if (invites.length > 1) {
      setInvites(invites.filter((_, i) => i !== index));
    }
  };

  const updateInvite = (index: number, field: keyof Invite, value: string) => {
    const updated = invites.map((invite, i) => 
      i === index ? { ...invite, [field]: value } : invite
    );
    setInvites(updated);
  };

  const handleSendInvites = () => {
    const validInvites = invites.filter(invite => 
      invite.email && invite.email.includes('@')
    );

    if (validInvites.length === 0) {
      toast.error('Please enter at least one valid email address');
      return;
    }

    // Simulate sending invites
    toast.success(`${validInvites.length} invitation(s) sent successfully!`);
    
    // Reset form
    setInvites([{ email: '', role: 'member' }]);
    setMessage('Join our team on Rune-Plan to collaborate on issues and projects.');
    onOpenChange(false);
  };

  const copyInviteLink = async () => {
    const inviteLink = 'https://rune-plan.com/invite/abc123';
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Invite link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy invite link');
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Full access to workspace settings and billing';
      case 'member':
        return 'Can create, edit, and manage issues and projects';
      case 'viewer':
        return 'Read-only access to issues and projects';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite Team Members
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invite Link */}
          <div className="space-y-2">
            <Label>Invite Link</Label>
            <div className="flex gap-2">
              <Input
                value="https://rune-plan.com/invite/abc123"
                readOnly
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyInviteLink}
                className="px-3"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Anyone with this link can request to join your workspace
            </p>
          </div>

          {/* Email Invites */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Email Invitations</Label>
              <Button variant="outline" size="sm" onClick={addInvite}>
                Add Another
              </Button>
            </div>

            <div className="space-y-3">
              {invites.map((invite, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Input
                      placeholder="Enter email address"
                      type="email"
                      value={invite.email}
                      onChange={(e) => updateInvite(index, 'email', e.target.value)}
                    />
                  </div>
                  <Select
                    value={invite.role}
                    onValueChange={(value) => updateInvite(index, 'role', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  {invites.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInvite(index)}
                      className="px-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Role Descriptions */}
            <div className="bg-muted rounded-lg p-3 space-y-2">
              <h4 className="text-sm font-medium">Role Permissions</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">Admin</Badge>
                  <span className="text-muted-foreground">{getRoleDescription('admin')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">Member</Badge>
                  <span className="text-muted-foreground">{getRoleDescription('member')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">Viewer</Badge>
                  <span className="text-muted-foreground">{getRoleDescription('viewer')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label>Custom Message (Optional)</Label>
            <Textarea
              placeholder="Add a personal message to your invitation..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-20"
            />
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSendInvites} className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Send Invitations
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}