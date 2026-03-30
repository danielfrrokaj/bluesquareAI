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
import { Loader2, Mail, Phone, MapPin, Instagram, Facebook, Linkedin, ArrowRight, Sparkles } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Link from 'next/link';
import Image from 'next/image';
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
        <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden bg-black text-white">
          {/* Background Wallpaper */}
          <div className="absolute inset-0 z-0">
             <Image 
                src="/background/wallpaper-dark3.jpg"
                alt="Contact Wallpaper"
                fill
                className="object-cover"
                priority
             />
             <div className="absolute inset-0 bg-black/50" />
             <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-white to-transparent" />
          </div>

          <div className="container relative z-10">
            <div className="max-w-5xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-6 py-2 text-[10px] font-black uppercase tracking-[0.3em] mb-10 text-white">
                <Sparkles className="h-3 w-3" />
                {lang === 'sq' ? 'Le të bisedojmë' : 'Let\'s talk'}
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold font-headline mb-10 tracking-tighter text-white leading-none">
                {currentContent.title}
              </h1>
              <p className="text-xl md:text-2xl text-zinc-300 leading-tight font-medium tracking-tight max-w-3xl">
                {currentContent.subtitle}
              </p>
            </div>
          </div>
        </section>

        <section className="py-24 md:py-40 bg-white border-t border-black/5">
            <div className="container">
                <div className="grid lg:grid-cols-2 gap-32 items-start">
                    {/* Contact Form */}
                    <div className="relative">
                        <div className="mb-12">
                            <h2 className="text-3xl md:text-4xl font-extrabold font-headline text-black mb-4 tracking-tighter">{currentContent.formTitle}</h2>
                            <p className="text-lg text-zinc-500 font-medium tracking-tight">{currentContent.formDescription}</p>
                        </div>
                        
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                                <div className="grid md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-8">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 ml-4 mb-2 block">{currentContent.nameLabel}</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        placeholder={currentContent.namePlaceholder} 
                                                        {...field} 
                                                        disabled={isSubmitting} 
                                                        className="h-16 md:h-18 rounded-2xl border-black/5 bg-black/[0.02] focus:bg-white focus:border-black/20 focus:ring-0 transition-all text-base font-medium px-6"
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
                                                <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 ml-4 mb-2 block">{currentContent.emailLabel}</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        placeholder={currentContent.emailPlaceholder} 
                                                        {...field} 
                                                        disabled={isSubmitting} 
                                                        className="h-16 md:h-18 rounded-2xl border-black/5 bg-black/[0.02] focus:bg-white focus:border-black/20 focus:ring-0 transition-all text-base font-medium px-6"
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
                                            <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 ml-4 mb-2 block">{currentContent.messageLabel}</FormLabel>
                                            <FormControl>
                                                <Textarea 
                                                    placeholder={currentContent.messagePlaceholder} 
                                                    {...field} 
                                                    disabled={isSubmitting} 
                                                    rows={6} 
                                                    className="rounded-3xl border-black/5 bg-black/[0.02] focus:bg-white focus:border-black/20 focus:ring-0 transition-all text-base font-medium px-6 py-6 resize-none"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" size="lg" className="w-full h-16 md:h-20 rounded-full bg-black text-white hover:bg-zinc-800 font-extrabold text-xl shadow-xl transition-all hover:scale-[1.02]" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : (
                                        <div className="flex items-center gap-3">
                                            {currentContent.submitButton}
                                            <ArrowRight className="h-5 w-5" />
                                        </div>
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </div>

                    {/* Contact Info & Map */}
                    <div className="space-y-16">
                        <div className="grid sm:grid-cols-2 gap-10">
                            <div className="group p-8 md:p-10 rounded-[3.5rem] border border-black/5 bg-black/[0.01] hover:bg-black hover:text-white transition-all duration-700 shadow-sm">
                                <div className="p-6 rounded-2xl bg-white shadow-sm border border-black/5 w-fit mb-10 text-black transition-colors">
                                    <Phone className="h-8 w-8" />
                                </div>
                                <h3 className="text-xs font-bold mb-3 tracking-[0.3em] uppercase text-black/40 group-hover:text-white/40">{currentContent.phone}</h3>
                                <a href="tel:+355693815070" className="text-xl md:text-2xl font-extrabold tracking-tight hover:underline underline-offset-8 whitespace-nowrap">
                                    +355 69 381 5070
                                </a>
                            </div>

                            <div className="group p-8 md:p-10 rounded-[3.5rem] border border-black/5 bg-black/[0.01] hover:bg-black hover:text-white transition-all duration-700 shadow-sm">
                                <div className="p-6 rounded-2xl bg-white shadow-sm border border-black/5 w-fit mb-10 text-black transition-colors">
                                    <Mail className="h-8 w-8" />
                                </div>
                                <h3 className="text-xs font-bold mb-3 tracking-[0.3em] uppercase text-black/40 group-hover:text-white/40">{currentContent.emailLabel}</h3>
                                <a href="mailto:info@bluesquare.ai" className="text-xl md:text-2xl font-extrabold tracking-tight hover:underline underline-offset-8 whitespace-nowrap">
                                    info@bluesquare.ai
                                </a>
                            </div>

                            <div className="group p-8 md:p-10 rounded-[3.5rem] border border-black/5 bg-black/[0.01] hover:bg-black hover:text-white transition-all duration-700 shadow-sm sm:col-span-2">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-12">
                                    <div>
                                        <div className="p-6 rounded-2xl bg-white shadow-sm border border-black/5 w-fit mb-10 text-black transition-colors">
                                            <MapPin className="h-8 w-8" />
                                        </div>
                                        <h3 className="text-xs font-bold mb-3 tracking-[0.3em] uppercase text-black/40 group-hover:text-white/40">{currentContent.address}</h3>
                                        <p className="text-xl md:text-2xl font-extrabold tracking-tight">Tirana, Albania</p>
                                    </div>
                                    <div className="flex gap-6">
                                        {[Instagram, Facebook, Linkedin].map((Icon, i) => (
                                            <Link key={i} href="#" className="h-16 w-16 rounded-2xl border border-black/10 flex items-center justify-center hover:bg-white hover:text-black transition-all group-hover:bg-white/10 group-hover:border-white/20 group-hover:text-white">
                                                <Icon className="h-6 w-6" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Map Row */}
                <div className="mt-20 md:mt-32 relative rounded-[2.5rem] md:rounded-[4rem] overflow-hidden border border-black/5 h-[400px] md:h-[600px] shadow-2xl group transition-all duration-700 hover:scale-[1.005]">
                    <LeafletMap 
                        latitude={mapCoords.lat}
                        longitude={mapCoords.lng}
                        zoom={mapCoords.zoom}
                        popupText={currentContent.mapPopup}
                    />
                    <div className="absolute top-10 left-10 z-10">
                        <div className="bg-white/95 backdrop-blur-3xl px-8 py-4 rounded-3xl border border-black/5 text-sm font-black text-black flex items-center gap-4 shadow-2xl">
                            <div className="h-3 w-3 bg-primary rounded-full animate-pulse" />
                            <span className="tracking-[0.2em] uppercase">{currentContent.location}</span>
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