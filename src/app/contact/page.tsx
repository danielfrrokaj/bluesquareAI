
'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { submitContactForm } from '@/app/actions';
import { Loader2, Mail, Phone, MapPin, Instagram, Facebook, Linkedin } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

export default function ContactPage({ searchParams }: { searchParams: { lang?: string } }) {
  const lang = useMemo(() => searchParams?.lang === 'sq' ? 'sq' : 'en', [searchParams?.lang]);
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

  const content = {
      sq: {
          title: "Na Kontaktoni",
          subtitle: "Keni një pyetje apo dëshironi të punojmë së bashku? Na shkruani.",
          formTitle: "Na dërgoni një mesazh",
          formDescription: "Ne jemi këtu për t'ju ndihmuar.",
          nameLabel: "Emri",
          namePlaceholder: "Emri juaj",
          emailLabel: "Email",
          emailPlaceholder: "email@shembull.com",
          messageLabel: "Mesazhi",
          messagePlaceholder: "Si mund t'ju ndihmojmë?",
          submitButton: "Dërgo Mesazhin",
          contactInfoTitle: "Informacioni i Kontaktit",
          contactInfoDescription: "Plotësoni formularin dhe ekipi ynë do t'ju kthehet brenda 24 orëve.",
          phone: "Telefoni",
          address: "Adresa",
          followUs: "Na ndiqni"
      },
      en: {
          title: "Get in Touch",
          subtitle: "Have a question or want to work together? We'd love to hear from you.",
          formTitle: "Send us a Message",
          formDescription: "We are here to help you.",
          nameLabel: "Name",
          namePlaceholder: "Your Name",
          emailLabel: "Email",
          emailPlaceholder: "your.email@example.com",
          messageLabel: "Message",
          messagePlaceholder: "How can we help you?",
          submitButton: "Send Message",
          contactInfoTitle: "Contact Information",
          contactInfoDescription: "Fill out the form and our team will get back to you within 24 hours.",
          phone: "Phone",
          address: "Address",
          followUs: "Follow Us"
      }
  }

  const currentContent = content[lang];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header lang={lang} />
      <main className="flex-1">
        <section id="contact" className="bg-background py-16 md:py-24 fade-in">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                    {currentContent.title}
                </h1>
                <p className="max-w-2xl text-muted-foreground md:text-xl/relaxed">
                    {currentContent.subtitle}
                </p>
            </div>
            <div className="grid lg:grid-cols-2 gap-12 items-start">
                <div className="flex flex-col space-y-8">
                    <div>
                      <h3 className="text-2xl font-bold font-headline mb-4">{currentContent.contactInfoTitle}</h3>
                      <p className="text-muted-foreground mb-6">
                          {currentContent.contactInfoDescription}
                      </p>
                      <div className="space-y-4">
                          <div className="flex items-center gap-4">
                              <div className="bg-primary/10 p-3 rounded-full">
                                  <Phone className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                  <p className="text-lg font-semibold">{currentContent.phone}</p>
                                  <a href="tel:+355693815070" className="text-muted-foreground hover:text-primary transition-colors">
                                      +355 69 381 5070
                                  </a>
                              </div>
                          </div>
                          <div className="flex items-center gap-4">
                              <div className="bg-primary/10 p-3 rounded-full">
                                  <Mail className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                  <p className="text-lg font-semibold">{currentContent.emailLabel}</p>
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
                                  <p className="text-lg font-semibold">{currentContent.address}</p>
                                  <p className="text-muted-foreground">Tirana, Albania</p>
                              </div>
                          </div>
                      </div>
                    </div>
                     <div>
                      <h3 className="text-2xl font-bold font-headline mb-4">{currentContent.followUs}</h3>
                       <div className="flex gap-4">
                            <Link href="#" className="bg-primary/10 p-3 rounded-full text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                                <Facebook className="h-6 w-6" />
                            </Link>
                            <Link href="#" className="bg-primary/10 p-3 rounded-full text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                                <Instagram className="h-6 w-6" />
                            </Link>
                            <Link href="#" className="bg-primary/10 p-3 rounded-full text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                                <Linkedin className="h-6 w-6" />
                            </Link>
                       </div>
                    </div>
                </div>
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle>{currentContent.formTitle}</CardTitle>
                    <CardDescription>{currentContent.formDescription}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>{currentContent.nameLabel}</FormLabel>
                                <FormControl>
                                    <Input placeholder={currentContent.namePlaceholder} {...field} disabled={isSubmitting} />
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
                                <FormLabel>{currentContent.emailLabel}</FormLabel>
                                <FormControl>
                                    <Input placeholder={currentContent.emailPlaceholder} {...field} disabled={isSubmitting} />
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
                                <FormLabel>{currentContent.messageLabel}</FormLabel>
                                <FormControl>
                                    <Textarea placeholder={currentContent.messagePlaceholder} {...field} disabled={isSubmitting} rows={5} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="animate-spin" /> : currentContent.submitButton}
                            </Button>
                        </form>
                    </Form>
                  </CardContent>
                </Card>
            </div>
            
            <div className="mt-16">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline text-center mb-8">Our Location</h2>
                <div className="rounded-lg overflow-hidden border-2 border-primary/20 shadow-lg">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2996.342936279184!2d19.81175197600865!3d41.3245227713028!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1350310e5f48868d%3A0xca47f6a7d33bd6a2!2sBlue%20Square%20Marketing!5e0!3m2!1sen!2sus!4v1724699500000!5m2!1sen!2sus"
                        width="100%"
                        height="450"
                        style={{ border: 0 }}
                        allowFullScreen={false}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="map-iframe"
                    ></iframe>
                </div>
            </div>

          </div>
        </section>
      </main>
      <Footer lang={lang} />
       <style jsx>{`
        .map-iframe {
          filter: grayscale(1) invert(0.9) sepia(0.8) hue-rotate(180deg) saturate(300%) brightness(0.9);
        }
      `}</style>
    </div>
  );
}
