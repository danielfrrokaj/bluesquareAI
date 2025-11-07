'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, X, Loader2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { handleChatbotQuery, savePhoneNumber } from '@/app/actions';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type ChatbotProps = {
  lang: 'en' | 'sq';
};

const translations = {
  en: {
    greeting: "Hello! How can I help you today?",
    placeholder: "Type your message...",
    phonePlaceholder: "Enter your phone number...",
    error: "An error occurred.",
    submit: "Send",
    phoneSubmit: "Submit Phone Number",
    phoneSuccess: "Thank you! Our team will contact you shortly.",
    phoneError: "There was a problem saving your number. Please try again."
  },
  sq: {
    greeting: 'Përshëndetje! Si mund t\'ju ndihmoj sot?',
    placeholder: 'Shkruani mesazhin tuaj...',
    phonePlaceholder: 'Vendosni numrin tuaj të telefonit...',
    error: 'Ndodhi një gabim.',
    submit: 'Dërgo',
    phoneSubmit: 'Dërgo Numrin',
    phoneSuccess: 'Faleminderit! Ekipi ynë do t\'ju kontaktojë së shpejti.',
    phoneError: 'Pati një problem me ruajtjen e numrit tuaj. Ju lutem provoni përsëri.'
  },
};

export function Chatbot({ lang }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requiresPhoneNumber, setRequiresPhoneNumber] = useState(false);
  const [siteContent, setSiteContent] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const t = translations[lang];

  useEffect(() => {
    // Reset and greet when language changes
    setMessages([{ role: 'assistant', content: t.greeting }]);
    setRequiresPhoneNumber(false);
  }, [lang, t.greeting]);

  useEffect(() => {
    // Fetch and set site content when the component mounts or language changes
    try {
        const content = document.body.innerText;
        setSiteContent(content);
    } catch (e) {
        console.error("Could not get site content", e);
    }
  }, [isOpen, lang]);

  const scrollToBottom = () => {
    setTimeout(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    const history = messages.map(m => ({ role: m.role, content: m.content }));
    const result = await handleChatbotQuery(history, currentInput, lang, siteContent);
    
    if (result.success && result.response) {
      const assistantMessage: Message = { role: 'assistant', content: result.response };
      setMessages((prev) => [...prev, assistantMessage]);
      if(result.requiresPhoneNumber) {
        setRequiresPhoneNumber(true);
      }
    } else {
      const errorMessage: Message = { role: 'assistant', content: result.error || t.error };
      setMessages((prev) => [...prev, errorMessage]);
    }
    
    setIsLoading(false);
  };
  
  const handlePhoneSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;
      
      setIsLoading(true);
      const phoneNumber = input;
      // Pass the whole messages array
      const result = await savePhoneNumber(phoneNumber, messages, lang);

      if (result.success) {
          toast({ title: t.phoneSuccess });
          const successMessage: Message = { role: 'assistant', content: t.phoneSuccess };
          setMessages((prev) => [...prev, successMessage]);
          setRequiresPhoneNumber(false);
      } else {
          toast({ variant: 'destructive', title: t.phoneError, description: result.error });
          const errorMessage: Message = { role: 'assistant', content: t.phoneError };
           setMessages((prev) => [...prev, errorMessage]);
      }
      setInput('');
      setIsLoading(false);
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            className="fixed bottom-4 right-4 h-16 w-16 rounded-full shadow-lg"
            size="icon"
            aria-label="Open Chat"
          >
            <Bot className="h-8 w-8" />
          </Button>
        </SheetTrigger>
        <SheetContent className="flex flex-col p-0" side="right">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2 font-headline">
              <Bot className="h-6 w-6 text-primary" />
              Blue Square Assistant
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1" ref={scrollAreaRef}>
             <div className="p-4 space-y-4">
              {messages.map((message, index) => (
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
              {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                   <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                   <div className="max-w-xs rounded-lg px-3 py-2 text-sm bg-muted flex items-center">
                     <Loader2 className="h-5 w-5 animate-spin"/>
                   </div>
                </div>
              )}
             </div>
          </ScrollArea>
          <SheetFooter className="p-4 border-t">
             {requiresPhoneNumber ? (
                <form onSubmit={handlePhoneSubmit} className="flex w-full items-center space-x-2">
                    <Input
                        type="tel"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t.phonePlaceholder}
                        autoComplete="off"
                        disabled={isLoading}
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                        <Phone className="h-4 w-4" />
                        <span className="sr-only">{t.phoneSubmit}</span>
                    </Button>
                </form>
             ) : (
                <form onSubmit={handleMessageSubmit} className="flex w-full items-center space-x-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t.placeholder}
                    autoComplete="off"
                    disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                    <Send className="h-4 w-4" />
                    <span className="sr-only">{t.submit}</span>
                </Button>
                </form>
             )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
