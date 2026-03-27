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
import { Loader2, Mail, Phone, MapPin, Instagram, Facebook, Linkedin, ArrowRight } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

// Dynamically import LeafletMap to ensure it only renders on the client side
const LeafletMap = dynamic(() => import('@/components/leaflet-map').then(mod => mod.LeafletMap), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-black/5 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-black" /></div>,
});


const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

const pageContent = {
    sq: {
        title: "Na Kontaktoni",
        subtitle: "Kemi një pyetje apo dëshironi të bashkëpunojmë? Ekipi ynë është këtu për t'ju ndihmuar.",
        formTitle: "Dërgo një mesazh",
        formDescription: "Plotësoni formularin dhe do t'ju përgjigjemi sa më shpejt.",
        nameLabel: "Emri juaj",
        namePlaceholder: "P.sh. Filan Fisteku",
        emailLabel: "Email",
        emailPlaceholder: "emri@shembull.com",
        messageLabel: "Mesazhi",
        messagePlaceholder: "Si mund t'ju ndihmojmë?",
        submitButton: "Dërgo Mesazhin",
        contactInfoTitle: "Informacioni i Kontaktit",
        contactInfoDescription: "Na gjeni në rrjetet sociale ose na kontaktoni direkt.",
        phone: "Telefoni",
        address: "Adresa",
        followUs: "Na ndiqni",
        location: "Vendndodhja",
        mapPopup: "Zyra Qendrore Blue Square AI"
    },
    en: {
        title: "Get in Touch",
        subtitle: "Have a question or want to work together? Our team is here to help you scaling your business.",
        formTitle: "Send a message",
        formDescription: "Fill out the form below and we'll get back to you shortly.",
        nameLabel: "Your Name",
        namePlaceholder: "e.g. John Doe",
        emailLabel: "Email",
        emailPlaceholder: "your.email@example.com",
        messageLabel: "Message",
        messagePlaceholder: "How can we help you?",
        submitButton: "Send Message",
        contactInfoTitle: "Contact Information",
        contactInfoDescription: "Find us on social media or contact us directly.",
        phone: "Phone",
        address: "Address",
        followUs: "Follow Us",
        location: "Location",
        mapPopup: "Blue Square AI Headquarters"
    }
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
  
  const mapCoords = {
    lat: 41.324522775013385,
    lng: 19.81432694199336,
    zoom: 17,
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header lang={lang} />
      <main className="flex-1">
        <section className="relative pt-32 pb-16 md:pt-48 md:pb-24 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-50 to-transparent -z-10" />
            <div className="container relative z-10">
                <div className="max-w-3xl">
                    <div className="inline-flex items-center rounded-full border border-black/5 bg-black/5 px-3 py-1 text-sm font-medium mb-8">
                        {lang === 'sq' ? 'Le të bisedojmë' : 'Let\'s talk'}
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold font-headline mb-8 tracking-tight text-black">
                        {currentContent.title}
                    </h1>
                    <p className="text-xl md:text-2xl text-black/60 leading-relaxed font-medium">
                        {currentContent.subtitle}
                    </p>
                </div>
            </div>
        </section>

        <section className="py-20 md:py-32 border-t border-black/5">
            <div className="container">
                <div className="grid lg:grid-cols-2 gap-20 items-start">
                    {/* Contact Form */}
                    <div className="relative">
                        <div className="mb-12">
                            <h2 className="text-3xl font-bold font-headline text-black mb-4">{currentContent.formTitle}</h2>
                            <p className="text-black/50 font-medium">{currentContent.formDescription}</p>
                        </div>
                        
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-bold uppercase tracking-wider text-black/40">{currentContent.nameLabel}</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        placeholder={currentContent.namePlaceholder} 
                                                        {...field} 
                                                        disabled={isSubmitting} 
                                                        className="h-14 rounded-2xl border-black/5 bg-black/5 focus:bg-white transition-all text-base font-medium"
                                                    />
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
                                                <FormLabel className="text-sm font-bold uppercase tracking-wider text-black/40">{currentContent.emailLabel}</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        placeholder={currentContent.emailPlaceholder} 
                                                        {...field} 
                                                        disabled={isSubmitting} 
                                                        className="h-14 rounded-2xl border-black/5 bg-black/5 focus:bg-white transition-all text-base font-medium"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="message"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-bold uppercase tracking-wider text-black/40">{currentContent.messageLabel}</FormLabel>
                                            <FormControl>
                                                <Textarea 
                                                    placeholder={currentContent.messagePlaceholder} 
                                                    {...field} 
                                                    disabled={isSubmitting} 
                                                    rows={6} 
                                                    className="rounded-2xl border-black/5 bg-black/5 focus:bg-white transition-all text-base font-medium resize-none"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" size="lg" className="w-full h-16 rounded-2xl bg-black text-white hover:bg-black/90 font-bold text-lg group-button" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : (
                                        <>
                                            {currentContent.submitButton}
                                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </div>

                    {/* Contact Info & Map */}
                    <div className="space-y-12">
                        <div className="grid sm:grid-cols-2 gap-8">
                            <div className="group p-8 rounded-3xl border border-black/5 bg-black/5 hover:bg-black hover:text-white transition-all duration-300">
                                <div className="p-3 rounded-2xl bg-white/10 w-fit mb-6 text-black group-hover:text-white transition-colors">
                                    <Phone className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold mb-2 tracking-tight">{currentContent.phone}</h3>
                                <a href="tel:+355693815070" className="text-base font-medium opacity-60 hover:opacity-100 transition-opacity">
                                    +355 69 381 5070
                                </a>
                            </div>

                            <div className="group p-8 rounded-3xl border border-black/5 bg-black/5 hover:bg-black hover:text-white transition-all duration-300">
                                <div className="p-3 rounded-2xl bg-white/10 w-fit mb-6 text-black group-hover:text-white transition-colors">
                                    <Mail className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold mb-2 tracking-tight">{currentContent.emailLabel}</h3>
                                <a href="mailto:info@bluesquare.ai" className="text-base font-medium opacity-60 hover:opacity-100 transition-opacity break-all">
                                    info@bluesquare.ai
                                </a>
                            </div>

                            <div className="group p-8 rounded-3xl border border-black/5 bg-black/5 hover:bg-black hover:text-white transition-all duration-300 sm:col-span-2">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                                    <div>
                                        <div className="p-3 rounded-2xl bg-white/10 w-fit mb-6 text-black group-hover:text-white transition-colors">
                                            <MapPin className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-lg font-bold mb-2 tracking-tight">{currentContent.address}</h3>
                                        <p className="text-base font-medium opacity-60">Tirana, Albania</p>
                                    </div>
                                    <div className="flex gap-4">
                                        {[Instagram, Facebook, Linkedin].map((Icon, i) => (
                                            <Link key={i} href="#" className="h-12 w-12 rounded-2xl border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                                                <Icon className="h-5 w-5" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map */}
                        <div className="relative rounded-3xl overflow-hidden border border-black/5 h-[400px] shadow-2xl group">
                            <LeafletMap 
                                latitude={mapCoords.lat}
                                longitude={mapCoords.lng}
                                zoom={mapCoords.zoom}
                                popupText={currentContent.mapPopup}
                            />
                            <div className="absolute top-6 left-6 z-10">
                                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-black/5 text-sm font-bold text-black flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {currentContent.location}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
      </main>
      <Footer lang={lang} />
    </div>
  );
}