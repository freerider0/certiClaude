'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  MessageSquare,
  User,
  Users,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { type OrderWithDetails, type OrderCommunication, type MessageType } from '@/types/orders';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface OrderCommunicationsProps {
  order: OrderWithDetails;
  communications: OrderCommunication[];
}

const messageTypeConfig: Record<MessageType, { label: string; color: string; icon: any }> = {
  internal: { label: 'Internal', color: 'bg-gray-100 text-gray-800', icon: Users },
  customer: { label: 'Customer', color: 'bg-blue-100 text-blue-800', icon: User },
  provider: { label: 'Provider', color: 'bg-purple-100 text-purple-800', icon: User },
  system: { label: 'System', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
};

export function OrderCommunications({ order, communications }: OrderCommunicationsProps) {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('internal');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    setSending(true);
    try {
      // TODO: Implement message sending
      toast.success('Message sent');
      setMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getInitials = (senderId: string) => {
    // In a real app, you'd look up the user's name
    return 'U';
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Message List */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <CardDescription>
            Communication history for this order
          </CardDescription>
        </CardHeader>
        <CardContent>
          {communications.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                No messages yet
              </p>
              <p className="text-sm text-muted-foreground">
                Start a conversation about this order
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {communications.map((comm) => {
                  const typeConfig = messageTypeConfig[comm.message_type as MessageType];
                  const Icon = typeConfig.icon;
                  
                  return (
                    <div key={comm.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(comm.sender_id)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className={cn("text-xs", typeConfig.color)}>
                            <Icon className="mr-1 h-3 w-3" />
                            {typeConfig.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(comm.created_at), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        {comm.subject && (
                          <p className="font-medium text-sm mb-1">{comm.subject}</p>
                        )}
                        <p className="text-sm">{comm.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* New Message */}
      <Card>
        <CardHeader>
          <CardTitle>Send Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="message-type">Message Type</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {Object.entries(messageTypeConfig).map(([type, config]) => (
                <Button
                  key={type}
                  variant={messageType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMessageType(type as MessageType)}
                  className="cursor-pointer justify-start"
                >
                  <config.icon className="mr-2 h-4 w-4" />
                  {config.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="mt-2"
            />
          </div>

          <Button
            onClick={handleSend}
            disabled={!message.trim() || sending}
            className="w-full cursor-pointer"
          >
            <Send className="mr-2 h-4 w-4" />
            {sending ? 'Sending...' : 'Send Message'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}