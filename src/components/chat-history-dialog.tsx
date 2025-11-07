'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

interface ContactFormSubmission {
  id: string;
  phoneNumber: string;
  interestedServices: ChatMessage[];
  submissionDate: string;
  preferredLanguage: 'en' | 'sq';
}

interface ChatHistoryDialogProps {
  submission: ContactFormSubmission | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatHistoryDialog({ submission, isOpen, onClose }: ChatHistoryDialogProps) {
  if (!submission) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-2xl flex flex-col h-[80vh]">
        <DialogHeader>
          <DialogTitle>Chat History</DialogTitle>
          <DialogDescription>
            Review the conversation with {submission.phoneNumber}.
          </DialogDescription>
          <div className="flex justify-between items-center text-sm text-muted-foreground pt-2">
             <p>Date: {new Date(submission.submissionDate).toLocaleString()}</p>
             <Badge variant={submission.preferredLanguage === 'en' ? 'default' : 'secondary'}>
                {submission.preferredLanguage.toUpperCase()}
             </Badge>
          </div>
        </DialogHeader>
        <ScrollArea className="flex-1 rounded-md border p-4">
          <div className="space-y-4">
            {submission.interestedServices.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-xs rounded-lg px-3 py-2 text-sm',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  {message.content}
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
