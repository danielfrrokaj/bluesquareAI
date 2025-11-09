'use client';

import { useMemo } from 'react';
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
import Image from 'next/image';
import type { Metadata, ResolvingMetadata } from 'next';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

const pageContent = {
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
        followUs: "Na ndiqni",
        location: "Vendndodhja Jonë"
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
        followUs: "Follow Us",
        location: "Our Location"
    }
}

type Props = {
  searchParams: { lang?: string };
};

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const lang = searchParams?.lang === 'sq' ? 'sq' : 'en';
  const content = pageContent[lang];
  
  const title = content.title;
  const description = content.subtitle;
  const locale = lang === 'sq' ? 'sq_AL' : 'en_US';

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      locale: locale,
      images: ['/logo.png'],
    },
    twitter: {
      title: title,
      description: description,
      images: ['/logo.png'],
    },
  };
}

export default function ContactPage({ searchParams }: { searchParams?: { lang?: string } }) {
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

  const currentContent = pageContent[lang];
  
  const mapApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=41.324522775013385,19.81432694199336&zoom=17&size=600x450&markers=color:red%7C41.324522775013385,19.81432694199336&key=${mapApiKey}&style=feature:all|element:all|visibility:on&style=feature:all|element:geometry|color:0x131823&style=feature:all|element:labels.text.fill|color:0x8f98a3&style=feature:all|element:labels.text.stroke|visibility:off&style=feature:administrative|element:geometry|visibility:off&style=feature:administrative.land_parcel|element:labels|visibility:off&style=feature:poi|element:geometry|color:0x131823&style=feature:poi|element:labels.text|visibility:off&style=feature:poi.park|element:geometry.fill|color:0x131823&style=feature:road|element:geometry|color:0x2c3342&style=feature:road|element:labels.icon|visibility:off&style=feature:road.arterial|element:geometry|color:0x2c3342&style=feature:road.highway|element:geometry|color:0x2c3342&style=feature:road.local|element:geometry|color:0x2c3342&style=feature:transit|element:geometry|color:0x131823&style=feature:water|element:geometry|color:0x0e1119`;

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
              <div className="grid grid-cols-1 gap-12">
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
                <div className="flex flex-col space-y-8">
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
              </div>
              <div className="rounded-lg overflow-hidden border-2 border-primary/20 shadow-lg h-full min-h-[450px] lg:min-h-0">
                  {mapApiKey ? (
                    <Image
                      src={mapUrl}
                      alt="Our Location"
                      width={600}
                      height={450}
                      className="w-full h-full object-cover map-iframe"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <p className="text-muted-foreground">Google Maps API Key is missing.</p>
                    </div>
                  )}
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