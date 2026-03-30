'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Plane, 
  MapPin, 
  Hotel, 
  Calendar, 
  Settings, 
  ShieldCheck, 
  Sparkles,
  Database,
  Cloud,
  ChevronRight,
  TrendingUp,
  Users
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { FinalCtaSection } from '@/components/sections/final-cta-section';
import { motion } from 'framer-motion';

function TourismSystemsContent() {
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') === 'sq' ? 'sq' : 'en';

  const content = {
    sq: {
      tag: "Sisteme për Turizëm",
      title: "Discover Albania PMS: E Ardhmja e Menaxhimit të Mikpritjes",
      subtitle: "Transformoni mënyrën se si menaxhoni hotelin ose bujtinën tuaj me teknologjinë e fundit.",
      description: "Discover Albania PMS kombinon teknologjinë e fundit me lehtësinë në përdorim, duke i dhënë biznesit tuaj kontroll të plotë dhe vizitorëve një eksperiencë pa asnjë pengesë.",
      featuresHeader: "Karakteristikat Kryesore",
      features: [
        {
          title: "Integrim i Avancuar me AI",
          desc: "Automatizoni operacionet e përditshme, nga komunikimi i zgjuar me klientët deri te sugjerimet e personalizuara.",
          icon: <Sparkles className="h-6 w-6 text-black" />
        },
        {
          title: "Menaxhim Qendror (All-in-One)",
          desc: "Kontrolloni disponueshmërinë, çmimet dhe rezervimet nga platforma të ndryshme në kohë reale nga një pult i vetëm.",
          icon: <Database className="h-6 w-6 text-black" />
        },
        {
          title: "Fokus te Eksperienca Lokale",
          desc: "Sistemi lehtëson integrimin e tureve, agroturizmit dhe aventurave lokale për t'i ofruar turistëve një zbulim të vërtetë.",
          icon: <MapPin className="h-6 w-6 text-black" />
        },
        {
          title: "Cloud dhe Siguri e Lartë",
          desc: "Infrastrukturë cloud për të garantuar shpejtësi maksimale, qasje nga çdo pajisje dhe siguri absolute.",
          icon: <Cloud className="h-6 w-6 text-black" />
        }
      ],
      whyHeader: "Pse Discover Albania PMS?",
      whyText: "Nuk është thjesht një softuer, por një motor dixhital për rritjen e biznesit tuaj. Duke dixhitalizuar faturimin, menaxhimin e stafit dhe raportimet analitike, ky sistem ju lë të lirë të fokusoheni tek ajo që ka më shumë rëndësi: mikpritja e shkëlqyer.",
      stats: [
        { label: "Rezervime Real-Time", value: "100%" },
        { label: "Rritje Eficience", value: "40%+" },
        { label: "Mbështetje 24/7", value: "Zgjidhje" }
      ]
    },
    en: {
      tag: "Tourism Systems",
      title: "Discover Albania PMS: The Future of Hospitality Management",
      subtitle: "Transform the way you manage your hotel or guesthouse with cutting-edge technology.",
      description: "Discover Albania PMS combines the latest technology with ease of use, giving your business full control and visitors a seamless experience.",
      featuresHeader: "Key Features",
      features: [
        {
          title: "Advanced AI Integration",
          desc: "Automate daily operations, from smart customer communication to personalized recommendations.",
          icon: <Sparkles className="h-6 w-6 text-black" />
        },
        {
          title: "All-in-One Management",
          desc: "Control availability, pricing, and bookings from multiple platforms in real-time from a single dashboard.",
          icon: <Database className="h-6 w-6 text-black" />
        },
        {
          title: "Focus on Local Experience",
          desc: "The system facilitates integration of tours, agrotourism, and local adventures to offer tourists a true discovery.",
          icon: <MapPin className="h-6 w-6 text-black" />
        },
        {
          title: "High Performance Cloud",
          desc: "Cloud infrastructure guaranteeing maximum speed, access from any device, and absolute data security.",
          icon: <Cloud className="h-6 w-6 text-black" />
        }
      ],
      whyHeader: "Why Discover Albania PMS?",
      whyText: "It's not just software, it's a digital engine for your business growth. By digitalizing invoicing, staff management, and analytical reporting, this system leaves you free to focus on what matters most: excellent hospitality.",
      stats: [
        { label: "Real-Time Bookings", value: "100%" },
        { label: "Efficiency Increase", value: "40%+" },
        { label: "24/7 Support", value: "Solutions" }
      ]
    }
  };

  const c = content[lang];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header lang={lang} />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-32 pb-48 overflow-hidden bg-black text-white">
          {/* Background Wallpaper */}
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute inset-0 z-0"
          >
             <Image 
                src="/background/wallpaper-dark2.jpg"
                alt="Tourism Systems Wallpaper"
                fill
                className="object-cover scale-110"
                priority
             />
             <div className="absolute inset-0 bg-black/40" />
             <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-white to-transparent" />
          </motion.div>

          <div className="container px-4 mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="text-left flex flex-col items-start text-white">
                <div className="inline-flex items-center gap-2 px-5 py-2 mb-8 text-[10px] font-bold tracking-[0.2em] text-white uppercase bg-white/10 rounded-full border border-white/20 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                  {c.tag}
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold font-headline mb-8 md:mb-10 tracking-tighter leading-[1.1] md:leading-[1.15] text-white">
                  {c.title}
                </h1>
                <p className="text-lg md:text-2xl text-zinc-300 mb-10 md:mb-12 leading-relaxed max-w-xl font-medium tracking-tight">
                  {c.subtitle}
                </p>
              </div>
              <div className="relative group">
                <div className="relative z-10 p-8 md:p-12 bg-white/5 border border-white/10 rounded-[2.5rem] md:rounded-[4rem] backdrop-blur-xl shadow-2xl transition-all duration-700 group-hover:bg-white/10 group-hover:border-white/20 group-hover:shadow-[0_60px_100px_-20px_rgba(255,255,255,0.05)]">
                    <div className="aspect-video flex items-center justify-center overflow-hidden relative">
                       <Image 
                          src="https://firebasestorage.googleapis.com/v0/b/studio-3380920138-3317b.firebasestorage.app/o/abstract_png_images%2Fabstract_png.png?alt=media&token=acb9af53-c91b-4801-8f59-f96da034daf1"
                          alt="Discover Albania PMS Abstract Visualization"
                          fill
                          className="object-contain transition-transform duration-1000 group-hover:scale-105"
                          priority
                       />
                    </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white border-y border-black/5 relative overflow-hidden">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-blue-500/5 -z-0" />
          <div className="container px-4 mx-auto relative z-10">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-12 text-center">
              {c.stats.map((s, i) => (
                <div key={i} className="flex flex-col items-center group">
                  <span className="text-3xl md:text-6xl font-extrabold font-headline text-black mb-2 md:mb-3 tracking-tighter group-hover:text-blue-600 transition-colors duration-500">{s.value}</span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] group-hover:text-black transition-colors duration-500">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
 
        {/* Native Interface Showcase */}
        <section className="py-24 bg-zinc-50/50 border-b border-black/5">
           <div className="container px-4 mx-auto">
             <div className="max-w-6xl mx-auto space-y-16">
                <div className="flex flex-col items-center text-center">
                   <div className="inline-flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] text-blue-600 uppercase bg-blue-50/50 rounded-full border border-blue-100 mb-6">
                     Native Interface
                   </div>
                   <h2 className="text-3xl md:text-5xl font-extrabold font-headline text-black tracking-tighter">
                     Experience Discover Albania PMS
                   </h2>
                </div>
                <div className="grid md:grid-cols-2 gap-12">
                    <Card className="overflow-hidden border-black/5 shadow-xl rounded-[2rem] group bg-white">
                        <div className="relative aspect-video w-full">
                            <Image 
                                src="https://firebasestorage.googleapis.com/v0/b/studio-3380920138-3317b.firebasestorage.app/o/bluesquare%20AI%20website%2FScreenshot%202026-03-30%20at%202.06.14%E2%80%AFPM.png?alt=media&token=ba7a12a1-fc4b-40aa-a319-dbb33193dee1"
                                alt="System Interface 1"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                            />
                        </div>
                    </Card>
                    <Card className="overflow-hidden border-black/5 shadow-xl rounded-[2rem] group bg-white">
                        <div className="relative aspect-video w-full">
                            <Image 
                                src="https://firebasestorage.googleapis.com/v0/b/studio-3380920138-3317b.firebasestorage.app/o/bluesquare%20AI%20website%2FScreenshot%202026-03-30%20at%202.06.22%E2%80%AFPM.png?alt=media&token=f0209045-3704-4958-b463-5c6369cf9c30"
                                alt="System Interface 2"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                            />
                        </div>
                    </Card>
                </div>
             </div>
           </div>
        </section>

        {/* Experience Description */}
        <section className="py-32 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/[0.02] rounded-full blur-[150px] pointer-events-none" />
          <div className="container px-4 mx-auto relative z-10">
             <div className="max-w-5xl mx-auto text-center mb-16 md:mb-32">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] text-blue-600 uppercase bg-blue-50/50 rounded-full border border-blue-100 mb-8 md:mb-10">
                   {lang === 'sq' ? 'Ndërtimi i Ekselencës' : 'Building Excellence'}
                </div>
                <h3 className="text-2xl md:text-5xl font-extrabold font-headline text-black mb-6 md:mb-12 tracking-tighter max-w-4xl mx-auto leading-tight">
                  {c.whyHeader}
                </h3>
                <div className="w-20 md:w-24 h-1 md:h-1.5 bg-gradient-to-r from-blue-500 to-lime-500 rounded-full mx-auto" />
                <p className="text-lg md:text-3xl lg:text-4xl text-zinc-600 leading-snug font-normal tracking-tight max-w-4xl mx-auto mt-8 md:mt-16 italic">
                  "{c.whyText}"
                </p>
             </div>

             <div className="grid md:grid-cols-2 gap-6 lg:gap-12">
                {c.features.map((f, i) => (
                  <div key={i} className="flex flex-col sm:flex-row items-start gap-6 md:gap-8 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] bg-zinc-50/50 border border-black/[0.03] hover:bg-white hover:border-blue-200 hover:shadow-[0_40px_80px_-20px_rgba(59,130,246,0.1)] transition-all duration-500 group hover:-translate-y-2">
                     <div className="flex-shrink-0 p-4 md:p-5 bg-white rounded-2xl shadow-sm group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-500 flex items-center justify-center border border-black/[0.03]">
                        {f.icon}
                     </div>
                     <div>
                        <h3 className="text-xl md:text-2xl font-bold font-headline mb-3 md:mb-4 text-black tracking-tight">
                          {f.title}
                        </h3>
                        <p className="text-zinc-500 leading-relaxed text-base md:text-lg font-medium tracking-tight">
                          {f.desc}
                        </p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </section>

        {/* Systems Summary */}
        <section className="py-32 bg-white text-black overflow-hidden relative border-t border-black/5">
          <div className="container px-4 mx-auto relative z-10">
             <div className="grid lg:grid-cols-2 gap-24 items-center">
                <div className="order-2 lg:order-1 relative">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                       <Card className="p-8 md:p-10 bg-zinc-50/50 border-black/[0.03] hover:bg-white hover:border-blue-200 transition-all duration-500 rounded-[2.5rem] md:rounded-[3rem] group shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(59,130,246,0.1)] hover:-translate-y-2">
                          <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white flex items-center justify-center mb-6 md:mb-8 border border-black/5 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all shadow-sm">
                             <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-black" />
                          </div>
                          <h4 className="font-bold text-xl md:text-2xl mb-2 md:mb-3 text-black tracking-tight">Revenue Management</h4>
                          <p className="text-zinc-500 text-xs md:text-sm font-medium">Dynamic pricing and analytical insights.</p>
                       </Card>
                       <Card className="p-8 md:p-10 bg-zinc-50/50 border-black/[0.03] hover:bg-white hover:border-lime-200 transition-all duration-500 rounded-[2.5rem] md:rounded-[3rem] group shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(163,230,81,0.1)] hover:-translate-y-2 sm:mt-8">
                          <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white flex items-center justify-center mb-6 md:mb-8 border border-black/5 group-hover:bg-lime-50 group-hover:text-lime-600 transition-all shadow-sm">
                             <Users className="h-5 w-5 md:h-6 md:w-6 text-black" />
                          </div>
                          <h4 className="font-bold text-xl md:text-2xl mb-2 md:mb-3 text-black tracking-tight">Staff Control</h4>
                          <p className="text-zinc-500 text-xs md:text-sm font-medium">Efficient roles and task management.</p>
                       </Card>
                       <Card className="p-8 md:p-10 bg-zinc-50/50 border-black/[0.03] hover:bg-white hover:border-blue-200 transition-all duration-500 rounded-[2.5rem] md:rounded-[3rem] group shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(59,130,246,0.1)] hover:-translate-y-2">
                          <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white flex items-center justify-center mb-6 md:mb-8 border border-black/5 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all shadow-sm">
                             <Calendar className="h-5 w-5 md:h-6 md:w-6 text-black" />
                          </div>
                          <h4 className="font-bold text-xl md:text-2xl mb-2 md:mb-3 text-black tracking-tight">Booking Engine</h4>
                          <p className="text-zinc-500 text-xs md:text-sm font-medium">Seamless direct booking integration.</p>
                       </Card>
                       <Card className="p-8 md:p-10 bg-zinc-50/50 border-black/[0.03] hover:bg-white hover:border-lime-200 transition-all duration-500 rounded-[2.5rem] md:rounded-[3rem] group shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(163,230,81,0.1)] hover:-translate-y-2 sm:mt-8">
                          <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white flex items-center justify-center mb-6 md:mb-8 border border-black/5 group-hover:bg-lime-50 group-hover:text-lime-600 transition-all shadow-sm">
                             <Settings className="h-5 w-5 md:h-6 md:w-6 text-black" />
                          </div>
                          <h4 className="font-bold text-xl md:text-2xl mb-2 md:mb-3 text-black tracking-tight">Channel Manager</h4>
                          <p className="text-zinc-500 text-xs md:text-sm font-medium">Sync with Booking.com, Airbnb, etc.</p>
                       </Card>
                   </div>
                </div>
                <div className="order-1 lg:order-2 flex flex-col items-center lg:items-start text-center lg:text-left">
                   <div className="inline-flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] text-blue-600 uppercase bg-blue-50/50 rounded-full border border-blue-100 mb-8">
                      {lang === 'sq' ? 'Menaxhim i Plotë' : 'Complete Management'}
                   </div>
                   <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold font-headline mb-8 md:mb-10 tracking-tighter leading-[1.15] text-black">
                      Every tool for the <span className="text-blue-600">modern hospitality</span> era.
                   </h2>
                   <p className="text-lg md:text-2xl text-zinc-500 leading-relaxed mb-10 md:mb-12 font-medium tracking-tight">
                      We've designed Discover Albania PMS to be the ultimate companion for your tourism business, ensuring stability, growth, and excellence in service.
                   </p>
                   <Button size="lg" className="h-16 md:h-20 px-10 md:px-12 rounded-full font-bold text-lg md:text-xl bg-black text-white hover:bg-zinc-800 transition-all shadow-xl hover:scale-105 active:scale-95 w-full sm:w-auto">
                     {lang === 'sq' ? 'Kërko Konsultim Personal' : 'Request Personal Consultation'}
                   </Button>
                </div>
             </div>
          </div>
        </section>


        <FinalCtaSection lang={lang} />
      </main>
      <Footer lang={lang} />
    </div>
  );
}

export default function TourismSystemsPage() {
  return (
    <Suspense fallback={null}>
      <TourismSystemsContent />
    </Suspense>
  );
}
