'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bot, Send, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { subscribeToNewsletter } from '@/app/actions';

const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email.'),
});

export function Footer() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof newsletterSchema>>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: '' },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof newsletterSchema>) {
    const result = await subscribeToNewsletter(values);
    if (result.success) {
      toast({
        title: 'Subscribed!',
        description: "Thanks for joining our newsletter. You'll be the first to know about new features.",
      });
      form.reset();
    } else {
      toast({
        variant: 'destructive',
        title: 'Uh oh!',
        description: result.error || 'There was a problem with your subscription.',
      });
    }
  }

  const productLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Integrations', href: '#features' },
    { label: 'Download', href: '#' },
    { label: 'Pricing', href: '#pricing' },
  ];

  const companyLinks = [
    { label: 'About Us', href: '#' },
    { label: 'Latest Blog', href: '#' },
    { label: 'Our Clients', href: '#testimonials' },
    { label: 'Careers', href: '#' },
  ];

  return (
    <footer className="bg-card border-t border-border/20">
      <div className="container py-12 px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-3 flex flex-col items-start gap-4">
            <Link href="/" className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold font-headline">Sasico</span>
            </Link>
          </div>
          <div className="md:col-span-2">
            <h3 className="font-semibold mb-4 font-headline">Product</h3>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <h3 className="font-semibold mb-4 font-headline">Company</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-5">
            <h3 className="font-semibold mb-4 font-headline">Never miss an update — sign up today</h3>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
              <Input
                {...form.register('email')}
                placeholder="Enter your email"
                className="flex-1 bg-background"
                disabled={isSubmitting}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
                <span className="sr-only">Subscribe</span>
              </Button>
            </form>
            {form.formState.errors.email && (
                <p className="text-destructive text-xs mt-2">{form.formState.errors.email.message}</p>
            )}
          </div>
        </div>
        <div className="mt-8 border-t border-border/20 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>Sasico, {new Date().getFullYear()} ©️ All rights reserved</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="#" className="hover:text-primary transition-colors">Terms & Conditions</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
