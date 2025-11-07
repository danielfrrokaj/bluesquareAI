
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { submitContactForm } from '@/app/actions';
import { Loader2, Mail, Phone, MapPin } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { useInView } from '@/hooks/use-in-view';
import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

export function ContactSection() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', message: '' },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await submitContactForm(values);
    if (result.success) {
      toast({
        title: 'Message Sent!',
        description: "Thanks for reaching out. We'll get back to you shortly.",
      });
      form.reset();
    } else {
      toast({
        variant: 'destructive',
        title: 'Uh oh!',
        description: result.error || 'There was a problem sending your message.',
      });
    }
  }

  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section id="contact" className="bg-background" ref={ref}>
      <div className={cn("container px-4 md:px-6 transition-all duration-1000", isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10")}>
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                Get in Touch
            </h2>
            <p className="max-w-2xl text-muted-foreground md:text-xl/relaxed">
                Have a question or want to work together? We'd love to hear from you.
            </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="flex flex-col space-y-8">
                <div>
                  <h3 className="text-2xl font-bold font-headline mb-4">Contact Information</h3>
                  <p className="text-muted-foreground mb-6">
                      Fill out the form and our team will get back to you within 24 hours.
                  </p>
                  <div className="space-y-4">
                      <div className="flex items-center gap-4">
                          <div className="bg-primary/10 p-3 rounded-full">
                              <Phone className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                              <p className="text-lg font-semibold">Phone</p>
                              <a href="tel:+35512345678" className="text-muted-foreground hover:text-primary transition-colors">
                                  +355 123 456 78
                              </a>
                          </div>
                      </div>
                      <div className="flex items-center gap-4">
                          <div className="bg-primary/10 p-3 rounded-full">
                              <Mail className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                              <p className="text-lg font-semibold">Email</p>
                              <a href="mailto:info@bluesquare.ai" className="text-muted-foreground hover:text-primary transition-colors">
                                  info@bluesquare.ai
                              </a>
                          </div>
                      </div>
                      <div className="flex items-center gap-4">
                          <div className="bg-primary/10 p-3 rounded-full">
                              <MapPin className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                              <p className="text-lg font-semibold">Address</p>
                              <p className="text-muted-foreground">Tirana, Albania</p>
                          </div>
                      </div>
                  </div>
                </div>
            </div>
            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>We are here to help you.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Your Name" {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="your.email@example.com" {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                                <Textarea placeholder="How can we help you?" {...field} disabled={isSubmitting} rows={5} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'Send Message'}
                        </Button>
                    </form>
                </Form>
              </CardContent>
            </Card>
        </div>
      </div>
    </section>
  );
}
