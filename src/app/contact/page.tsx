'use client';

import { useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

// Leaflet map disabled per user request


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

function ContactContent() {
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') === 'sq' ? 'sq' : 'en';
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
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute inset-0 z-0"
          >
             <Image 
                src="/background/wallpaper-dark3.jpg"
                alt="Contact Wallpaper"
                fill
                className="object-cover scale-110"
                priority
             />
             <div className="absolute inset-0 bg-black/50" />
             <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-white to-transparent" />
          </motion.div>

          <div className="container relative z-10">
            <div className="max-w-5xl">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-6 py-2 text-[10px] font-black uppercase tracking-[0.3em] mb-10 text-white"
              >
                <Sparkles className="h-3 w-3" />
                {lang === 'sq' ? 'Le të bisedojmë' : 'Let\'s talk'}
              </motion.div>
              
              <motion.h1 
                initial={{ filter: 'blur(20px)', opacity: 0, y: 20 }}
                animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl md:text-7xl lg:text-8xl font-extrabold font-headline mb-10 tracking-tighter text-white leading-none"
              >
                {currentContent.title}
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-lg md:text-2xl text-zinc-300 leading-tight font-medium tracking-tight max-w-3xl"
              >
                {currentContent.subtitle}
              </motion.p>
            </div>
          </div>
        </section>

        <section className="py-24 md:py-32 bg-white">
            <div className="container px-4 mx-auto">
                <div className="grid lg:grid-cols-2 gap-20 xl:gap-32">
                    {/* Contact Form */}
                    <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-14 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] border border-black/5">
                        <div className="mb-12">
                            <h2 className="text-3xl md:text-4xl font-extrabold font-headline text-black mb-4 tracking-tight">{currentContent.formTitle}</h2>
                            <p className="text-zinc-500 text-base md:text-xl font-medium tracking-tight">{currentContent.formDescription}</p>
                        </div>
                        
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">{currentContent.nameLabel}</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder={currentContent.namePlaceholder} 
                                                    {...field} 
                                                    className="h-14 md:h-16 rounded-2xl bg-zinc-50 border-black/5 text-base md:text-lg font-medium px-6 focus:bg-white focus:ring-black/5 transition-all text-black"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500 font-medium" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">{currentContent.emailLabel}</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder={currentContent.emailPlaceholder} 
                                                    {...field} 
                                                    className="h-14 md:h-16 rounded-2xl bg-zinc-50 border-black/5 text-base md:text-lg font-medium px-6 focus:bg-white focus:ring-black/5 transition-all text-black"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500 font-medium" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="message"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">{currentContent.messageLabel}</FormLabel>
                                            <FormControl>
                                                <Textarea 
                                                    placeholder={currentContent.messagePlaceholder} 
                                                    {...field} 
                                                    className="min-h-[150px] md:min-h-[180px] rounded-2xl bg-zinc-50 border-black/5 text-base md:text-lg font-medium p-6 focus:bg-white focus:ring-black/5 transition-all resize-none text-black"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500 font-medium" />
                                        </FormItem>
                                    )}
                                />
                                <Button 
                                    type="submit" 
                                    className="w-full h-16 md:h-20 rounded-2xl bg-black text-white text-lg md:text-xl font-bold hover:bg-zinc-800 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                    ) : (
                                        <>
                                            {currentContent.submitButton}
                                            <ArrowRight className="ml-3 h-6 w-6" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </div>

                    {/* Contact Info & Map */}
                    <div className="flex flex-col">
                        <div className="mb-14">
                            <h2 className="text-3xl md:text-4xl font-extrabold font-headline text-black mb-4 tracking-tight">{currentContent.contactInfoTitle}</h2>
                            <p className="text-zinc-500 text-lg md:text-xl font-medium tracking-tight mb-12">{currentContent.contactInfoDescription}</p>
                            
                            <div className="grid gap-6">
                                <div className="p-6 md:p-8 rounded-3xl border border-black/5 bg-zinc-50/30 hover:bg-white hover:shadow-2xl transition-all duration-500 group flex items-center gap-6">
                                    <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-white border border-black/5 flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-all duration-500">
                                        <Phone className="h-5 w-5 md:h-6 md:w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 mb-1">{currentContent.phone}</h3>
                                        <a href="tel:+355693815070" className="text-lg md:text-2xl font-bold tracking-tighter block hover:underline underline-offset-4">+355 69 381 5070</a>
                                    </div>
                                </div>

                                <div className="p-6 md:p-8 rounded-3xl border border-black/5 bg-zinc-50/30 hover:bg-white hover:shadow-2xl transition-all duration-500 group flex items-center gap-6">
                                    <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-white border border-black/5 flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-all duration-500">
                                        <Mail className="h-5 w-5 md:h-6 md:w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 mb-1">{currentContent.emailLabel}</h3>
                                        <a href="mailto:info@bluesquare.ai" className="text-lg md:text-2xl font-bold tracking-tighter block hover:underline underline-offset-4">info@bluesquare.ai</a>
                                    </div>
                                </div>

                                <div className="p-6 md:p-8 rounded-3xl border border-black/5 bg-zinc-50/30 hover:bg-white hover:shadow-2xl transition-all duration-500 group">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                                        <div className="flex items-center gap-6">
                                            <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-white border border-black/5 flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-all duration-500">
                                                <MapPin className="h-5 w-5 md:h-6 md:w-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 mb-1">{currentContent.address}</h3>
                                                <p className="text-lg md:text-2xl font-bold tracking-tighter">Tirana, Albania</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            {[Instagram, Facebook, Linkedin].map((Icon, i) => (
                                                <Link key={i} href="#" className="h-12 w-12 rounded-xl border border-black/5 bg-white flex items-center justify-center hover:bg-black hover:text-white transition-all">
                                                    <Icon className="h-5 w-5" />
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map Row Disabled */}
                        <div className="mt-8 relative rounded-[2.5rem] overflow-hidden border border-black/5 h-[300px] md:h-[400px] shadow-2xl group transition-all duration-700 hover:scale-[1.005] flex-1 bg-zinc-50 flex items-center justify-center">
                            <div className="text-center px-10">
                                <div className="h-20 w-20 rounded-full bg-white border border-black/5 flex items-center justify-center mx-auto mb-6 shadow-xl">
                                    <MapPin className="h-8 w-8 text-black/20" />
                                </div>
                                <h3 className="text-xl font-bold tracking-tight mb-2 text-black">{currentContent.location}</h3>
                                <p className="text-zinc-500 font-medium max-w-[280px] mx-auto">Tirana, Albania</p>
                            </div>
                            <div className="absolute top-6 left-6 md:top-10 md:left-10 z-10">
                                <div className="bg-white/95 backdrop-blur-3xl px-6 py-3 md:px-8 md:py-4 rounded-2xl md:rounded-3xl border border-black/5 text-xs md:text-sm font-black text-black flex items-center gap-3 md:gap-4 shadow-2xl">
                                    <div className="h-3 w-3 bg-primary rounded-full animate-pulse" />
                                    <span className="tracking-[0.2em] uppercase">{currentContent.location}</span>
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

export default function ContactPage() {
    return (
        <Suspense fallback={null}>
            <ContactContent />
        </Suspense>
    );
}