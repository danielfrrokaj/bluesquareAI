'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Calendar,
  Settings,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Percent,
  Users,
  Database,
  Zap
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
      tag: "LuxHotel System",
      title: "Gjithçka që Nevojitet për Hotelin Tuaj, për Vetëm €2 / Dhomë",
      subtitle: "Rezervime, channel manager, 100+ kanale OTA dhe raporte financiare — nga një panel i vetëm. Pa instalim, pa komisione, nga çdo pajisje.",
      heroPills: ["Kalendar live", "100+ kanale OTA", "Raporte financiare"],
      ctaPrimary: "Shiko Demo",
      ctaSecondary: "Zbuloni Më Shumë",
      stats: [
        { label: "Kanale OTA", value: "100+" },
        { label: "Rritje Rezervimesh Direkte", value: "40%+" },
        { label: "Për Dhomë / Muaj", value: "€2" }
      ],
      devicesTag: "Nga Çdo Pajisje",
      devicesTitle: "I Njëjti Panel, në Çdo Ekran",
      devicesDesc: "Kompjuter në recepsion, tabletë në kat, telefon në xhep — LuxHotel System sinkronizohet në kohë reale, kudo që hapet.",
      deviceLabels: { monitor: "Kompjuter", tablet: "Tabletë", mobile: "Celular" },
      showcaseTag: "Produkti Live",
      showcaseTitle: "Eksploro LuxHotel System",
      showcase: [
        { title: "FrontDesk", url: "app.luxhotelsystem.com/dashboard", img: "https://luxhotelsystem.com/screenshots2/dashboard.png", kind: "browser" as const },
        { title: "Channel Manager", url: "app.luxhotelsystem.com/channel-manager", img: "https://luxhotelsystem.com/screenshots2/channelmanager.png", kind: "browser" as const },
        { title: "Raporte Financiare", url: "app.luxhotelsystem.com/raporte", img: "https://luxhotelsystem.com/raporte-financiare.png", kind: "browser" as const },
        { title: "Aplikacioni Mobil", img: "https://luxhotelsystem.com/iphones_floating_3d.png", kind: "mobile" as const },
      ],
      integrationsLabel: "Integrohet me",
      integrations: ["Booking.com", "Airbnb", "Expedia", "Agoda", "Trip.com"],
      featuresHeader: "Pse LuxHotel System?",
      features: [
        {
          title: "FrontDesk",
          desc: "Rezervime, check-in, check-out dhe caktim dhomash — të gjitha nga një panel i vetëm.",
          icon: <Calendar className="h-6 w-6 text-black" />
        },
        {
          title: "Channel Manager",
          desc: "Ndryshoni çmimin një herë — Booking.com, Airbnb, Expedia dhe 100+ platforma përditësohen automatikisht.",
          icon: <Settings className="h-6 w-6 text-black" />
        },
        {
          title: "Booking Engine",
          desc: "Lidhni faqen tuaj dhe lërini klientët të rezervojnë drejtpërdrejt — ju kurseni çdo komision OTA.",
          icon: <Sparkles className="h-6 w-6 text-black" />
        },
        {
          title: "Mbrojtje nga Overbooking",
          desc: "Sinkronizim në më pak se 5 sekonda dhe 0% overbooking, i garantuar në çdo kanal.",
          icon: <ShieldCheck className="h-6 w-6 text-black" />
        }
      ],
      whyHeader: "Ndërtuar për Mikpritje pa Kompromis",
      whyText: "Çdo pronar hoteli në Shqipëri të ketë akses në teknologji botërore, pa kompleksitet dhe pa çmime të papërballueshme. Pa instalim, pa kontrata afatgjata, me 30 ditë provë falas dhe mbështetje njerëzore 24/7.",
      testimonialsTag: "Klientë të Kënaqur",
      testimonialsTitle: "Çfarë thonë pronarët e hoteleve",
      testimonials: [
        { name: "Arben Kola", role: "Hotel Riviera, Sarandë", quote: "Overbooking-u u bë histori. Sinkronizimi me Booking.com dhe Airbnb është i menjëhershëm." },
        { name: "Mirela Hoxha", role: "Vila Berat", quote: "Raportimi financiar tani merr 5 minuta, jo 2 orë." },
        { name: "Gentian Dema", role: "Resort Dhermi Group", quote: "Me 3 prona dhe 80 dhoma, kisha nevojë për një sistem që i menaxhon të gjitha nga një vend." },
      ],
      summaryTag: "Integrime dhe Rezultate",
      summaryCards: [
        { title: "0% Komision", desc: "Rezervime direkte pa asnjë komision OTA.", icon: <Percent className="h-5 w-5 md:h-6 md:w-6 text-black" /> },
        { title: "50+ Prona Aktive", desc: "Hotele dhe bujtina në të gjithë Shqipërinë.", icon: <Users className="h-5 w-5 md:h-6 md:w-6 text-black" /> },
        { title: "100+ Kanale OTA", desc: "Booking.com, Airbnb, Expedia, Agoda, Trip.com dhe më shumë.", icon: <Database className="h-5 w-5 md:h-6 md:w-6 text-black" /> },
        { title: "< 5 Sek Sync", desc: "Sinkronizim i çmimeve dhe disponueshmërisë në kohë reale.", icon: <Zap className="h-5 w-5 md:h-6 md:w-6 text-black" /> },
      ],
      summaryHeading: "Çdo mjet për epokën moderne të mikpritjes.",
      summaryHeadingHighlight: "mikpritjes",
      summaryText: "Krijuam LuxHotel System për të qenë shoku ideal i hotelit ose bujtinës suaj — stabilitet, rritje dhe eksperiencë e shkëlqyer për mysafirët, për vetëm €2 për dhomë në muaj.",
      summaryCta: "Kërko Konsultim Personal",
      summaryCtaSecondary: "Ose Shiko Demo",
    },
    en: {
      tag: "LuxHotel System",
      title: "Everything Your Hotel Needs, for Just €2 / Room",
      subtitle: "Reservations, channel manager, 100+ OTA channels, and financial reports — from a single dashboard. No installation, no commissions, from any device.",
      heroPills: ["Live calendar", "100+ OTA channels", "Financial reports"],
      ctaPrimary: "See Demo",
      ctaSecondary: "Learn More",
      stats: [
        { label: "OTA Channels", value: "100+" },
        { label: "More Direct Bookings", value: "40%+" },
        { label: "Per Room / Month", value: "€2" }
      ],
      devicesTag: "From Any Device",
      devicesTitle: "The Same Dashboard, on Every Screen",
      devicesDesc: "Computer at the front desk, tablet on the floor, phone in your pocket — LuxHotel System stays in sync in real time, wherever it's opened.",
      deviceLabels: { monitor: "Computer", tablet: "Tablet", mobile: "Mobile" },
      showcaseTag: "Live Product",
      showcaseTitle: "Explore LuxHotel System",
      showcase: [
        { title: "FrontDesk", url: "app.luxhotelsystem.com/dashboard", img: "https://luxhotelsystem.com/screenshots2/dashboard.png", kind: "browser" as const },
        { title: "Channel Manager", url: "app.luxhotelsystem.com/channel-manager", img: "https://luxhotelsystem.com/screenshots2/channelmanager.png", kind: "browser" as const },
        { title: "Financial Reports", url: "app.luxhotelsystem.com/reports", img: "https://luxhotelsystem.com/raporte-financiare.png", kind: "browser" as const },
        { title: "Mobile App", img: "https://luxhotelsystem.com/iphones_floating_3d.png", kind: "mobile" as const },
      ],
      integrationsLabel: "Integrates with",
      integrations: ["Booking.com", "Airbnb", "Expedia", "Agoda", "Trip.com"],
      featuresHeader: "Why LuxHotel System?",
      features: [
        {
          title: "FrontDesk",
          desc: "Reservations, check-in, check-out, and room assignment — all from a single dashboard.",
          icon: <Calendar className="h-6 w-6 text-black" />
        },
        {
          title: "Channel Manager",
          desc: "Update your price once — Booking.com, Airbnb, Expedia, and 100+ platforms update automatically.",
          icon: <Settings className="h-6 w-6 text-black" />
        },
        {
          title: "Booking Engine",
          desc: "Connect your website and let guests book directly — you save every OTA commission.",
          icon: <Sparkles className="h-6 w-6 text-black" />
        },
        {
          title: "Overbooking Protection",
          desc: "Sync in under 5 seconds and 0% overbooking, guaranteed across every channel.",
          icon: <ShieldCheck className="h-6 w-6 text-black" />
        }
      ],
      whyHeader: "Built for Hospitality Without Compromise",
      whyText: "Giving every hotel owner in Albania access to world-class technology, without complexity or unaffordable prices. No installation, no long-term contracts, a 30-day free trial, and real human support 24/7.",
      testimonialsTag: "Happy Clients",
      testimonialsTitle: "What hotel owners say",
      testimonials: [
        { name: "Arben Kola", role: "Hotel Riviera, Sarandë", quote: "Overbooking became history. Syncing with Booking.com and Airbnb is instant." },
        { name: "Mirela Hoxha", role: "Vila Berat", quote: "Financial reporting now takes 5 minutes, not 2 hours." },
        { name: "Gentian Dema", role: "Resort Dhermi Group", quote: "With 3 properties and 80 rooms, I needed a system that manages everything from one place." },
      ],
      summaryTag: "Integrations & Results",
      summaryCards: [
        { title: "0% Commission", desc: "Direct bookings with zero OTA commission.", icon: <Percent className="h-5 w-5 md:h-6 md:w-6 text-black" /> },
        { title: "50+ Active Properties", desc: "Hotels and guesthouses across Albania.", icon: <Users className="h-5 w-5 md:h-6 md:w-6 text-black" /> },
        { title: "100+ OTA Channels", desc: "Booking.com, Airbnb, Expedia, Agoda, Trip.com, and more.", icon: <Database className="h-5 w-5 md:h-6 md:w-6 text-black" /> },
        { title: "< 5 Sec Sync", desc: "Real-time pricing and availability synchronization.", icon: <Zap className="h-5 w-5 md:h-6 md:w-6 text-black" /> },
      ],
      summaryHeading: "Every tool for the modern hospitality era.",
      summaryHeadingHighlight: "hospitality",
      summaryText: "We built LuxHotel System to be the ultimate companion for your hotel or guesthouse — stability, growth, and an excellent guest experience, for just €2 per room per month.",
      summaryCta: "Request Personal Consultation",
      summaryCtaSecondary: "Or See Demo",
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
                alt="LuxHotel System Wallpaper"
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
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                  className="inline-flex items-center gap-2 px-5 py-2 mb-8 text-[10px] font-bold tracking-[0.2em] text-white uppercase bg-white/10 rounded-full border border-white/20 backdrop-blur-md"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                  {c.tag}
                </motion.div>

                <motion.h1
                  initial={{ filter: 'blur(20px)', opacity: 0, y: 20 }}
                  animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold font-headline mb-8 md:mb-10 tracking-tighter leading-[1.1] md:leading-[1.15] text-white"
                >
                  {c.title}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="text-lg md:text-2xl text-zinc-300 mb-10 md:mb-12 leading-relaxed max-w-xl font-medium tracking-tight"
                >
                  {c.subtitle}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10"
                >
                  <Button asChild size="lg" className="h-14 md:h-16 px-8 md:px-10 rounded-full font-bold text-base md:text-lg bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-xl hover:scale-105 active:scale-95 w-full sm:w-auto">
                    <Link href="https://luxhotelsystem.com" target="_blank" rel="noopener noreferrer">
                      {c.ctaPrimary}
                      <ChevronRight className="ml-1 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-14 md:h-16 px-8 md:px-10 rounded-full font-bold text-base md:text-lg bg-white/5 text-white border-white/20 hover:bg-white/10 hover:text-white transition-all w-full sm:w-auto">
                    <a href="#features">{c.ctaSecondary}</a>
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-wrap items-center gap-3"
                >
                  {c.heroPills.map((pill, i) => (
                    <span key={i} className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white/80 bg-white/5 border border-white/10 rounded-full">
                      {pill}
                    </span>
                  ))}
                </motion.div>
              </div>
              <div className="relative group">
                <div className="relative z-10 p-6 md:p-10 bg-white/5 border border-white/10 rounded-[2.5rem] md:rounded-[4rem] backdrop-blur-xl shadow-2xl transition-all duration-700 group-hover:bg-white/10 group-hover:border-white/20 group-hover:shadow-[0_60px_100px_-20px_rgba(255,255,255,0.05)] overflow-hidden">
                    <div className="aspect-[1824/1198] flex items-center justify-center overflow-hidden relative">
                       <Image
                          src="https://luxhotelsystem.com/mac_floating_3d.png"
                          alt="LuxHotel System Dashboard and Calendar Preview"
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

        {/* Multi-Device Showcase */}
        <section className="py-24 md:py-32 bg-white relative overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-blue-500/[0.03] rounded-full blur-[160px] pointer-events-none" />
          <div className="container px-4 mx-auto relative z-10">
            <div className="flex flex-col items-center text-center mb-20 max-w-2xl mx-auto">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] text-blue-600 uppercase bg-blue-50/50 rounded-full border border-blue-100 mb-6">
                 {c.devicesTag}
               </div>
               <h2 className="text-3xl md:text-5xl font-extrabold font-headline text-black tracking-tighter mb-6">
                 {c.devicesTitle}
               </h2>
               <p className="text-lg md:text-xl text-zinc-500 leading-relaxed font-medium tracking-tight">
                 {c.devicesDesc}
               </p>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-16 md:gap-8 max-w-5xl mx-auto">
              {/* Monitor */}
              <div className="flex flex-col items-center gap-5 w-full max-w-[420px] md:max-w-none md:flex-1">
                 <div className="w-full rounded-t-xl bg-zinc-900 p-2.5 shadow-2xl">
                    <div className="relative aspect-[16/10] w-full rounded-md overflow-hidden bg-white">
                       <Image
                          src="https://luxhotelsystem.com/screenshots2/dashboard.png"
                          alt="LuxHotel System on Desktop"
                          fill
                          className="object-cover object-top"
                       />
                    </div>
                 </div>
                 <div className="h-5 w-10 bg-zinc-800" />
                 <div className="h-2 w-28 -mt-4 bg-zinc-700 rounded-full" />
                 <span className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">{c.deviceLabels.monitor}</span>
              </div>

              {/* Tablet */}
              <div className="flex flex-col items-center gap-5 w-full max-w-[260px] md:flex-1">
                 <div className="w-full rounded-[1.75rem] bg-zinc-900 p-3 shadow-2xl">
                    <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-white">
                       <Image
                          src="https://luxhotelsystem.com/raporte-financiare.png"
                          alt="LuxHotel System on Tablet"
                          fill
                          className="object-cover object-left-top"
                       />
                    </div>
                    <div className="h-1.5 w-8 bg-zinc-700 rounded-full mx-auto mt-2.5" />
                 </div>
                 <span className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">{c.deviceLabels.tablet}</span>
              </div>

              {/* Mobile */}
              <div className="flex flex-col items-center gap-5 w-full max-w-[180px] md:flex-1">
                 <div className="w-full rounded-[2rem] bg-zinc-900 p-2.5 shadow-2xl">
                    <div className="relative aspect-[722/1560] w-full rounded-[1.4rem] overflow-hidden bg-white">
                       <Image
                          src="https://luxhotelsystem.com/images/bookingEngineScreenshot.png"
                          alt="LuxHotel System on Mobile"
                          fill
                          className="object-cover object-top"
                       />
                       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-zinc-900 rounded-b-lg" />
                    </div>
                 </div>
                 <span className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">{c.deviceLabels.mobile}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Product Showcase */}
        <section id="features" className="py-24 bg-zinc-50/50 border-b border-black/5">
           <div className="container px-4 mx-auto">
             <div className="max-w-6xl mx-auto space-y-16">
                <div className="flex flex-col items-center text-center">
                   <div className="inline-flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] text-blue-600 uppercase bg-blue-50/50 rounded-full border border-blue-100 mb-6">
                     {c.showcaseTag}
                   </div>
                   <h2 className="text-3xl md:text-5xl font-extrabold font-headline text-black tracking-tighter">
                     {c.showcaseTitle}
                   </h2>
                </div>
                <div className="space-y-6 md:space-y-8">
                   {/* Featured screenshot */}
                   <Card className="overflow-hidden border-black/5 shadow-xl hover:shadow-2xl hover:border-blue-200 transition-all duration-500 rounded-[1.5rem] md:rounded-[2rem] bg-white group">
                      <div className="flex items-center gap-2 px-5 py-3.5 bg-zinc-50 border-b border-black/5">
                         <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                         <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                         <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                         <span className="mx-auto px-4 py-1 rounded-full bg-white border border-black/5 text-[10px] md:text-[11px] font-medium text-zinc-500 truncate max-w-[70%]">
                           {c.showcase[0].url}
                         </span>
                      </div>
                      <div className="relative w-full aspect-[16/9] bg-zinc-50">
                         <Image
                            src={c.showcase[0].img}
                            alt={c.showcase[0].title}
                            fill
                            className="object-contain p-3 md:p-6 transition-transform duration-700 group-hover:scale-[1.02]"
                         />
                      </div>
                      <div className="px-6 py-4 md:px-8 md:py-5 border-t border-black/5">
                         <span className="font-bold text-black text-base md:text-lg tracking-tight">{c.showcase[0].title}</span>
                      </div>
                   </Card>

                   {/* Supporting cards */}
                   <div className="grid sm:grid-cols-3 gap-6 md:gap-8">
                      {c.showcase.slice(1).map((item, i) => (
                         item.kind === 'browser' ? (
                            <Card key={i} className="overflow-hidden border-black/5 shadow-lg hover:shadow-xl hover:border-blue-200 transition-all duration-500 rounded-[1.5rem] md:rounded-[1.75rem] bg-white group">
                               <div className="flex items-center gap-1.5 px-4 py-3 bg-zinc-50 border-b border-black/5">
                                  <span className="h-2 w-2 rounded-full bg-red-400" />
                                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                                  <span className="h-2 w-2 rounded-full bg-green-400" />
                                  <span className="mx-auto px-3 py-0.5 rounded-full bg-white border border-black/5 text-[9px] font-medium text-zinc-500 truncate max-w-[65%]">
                                    {item.url}
                                  </span>
                               </div>
                               <div className="relative w-full aspect-[4/3] bg-zinc-50">
                                  <Image
                                     src={item.img}
                                     alt={item.title}
                                     fill
                                     className="object-contain p-3 transition-transform duration-700 group-hover:scale-[1.05]"
                                  />
                               </div>
                               <div className="px-5 py-3.5 border-t border-black/5">
                                  <span className="font-bold text-black text-sm md:text-base tracking-tight">{item.title}</span>
                               </div>
                            </Card>
                         ) : (
                            <Card key={i} className="overflow-hidden border-black/5 shadow-lg hover:shadow-xl transition-all duration-500 rounded-[1.5rem] md:rounded-[1.75rem] bg-[#0d1730] group">
                               <div className="relative w-full aspect-[4/3]">
                                  <Image
                                     src={item.img}
                                     alt={item.title}
                                     fill
                                     className="object-contain p-4 transition-transform duration-700 group-hover:scale-[1.05]"
                                  />
                               </div>
                               <div className="px-5 py-3.5 border-t border-white/10">
                                  <span className="font-bold text-white text-sm md:text-base tracking-tight">{item.title}</span>
                               </div>
                            </Card>
                         )
                      ))}
                   </div>
                </div>

                {/* Integrations strip */}
                <div className="flex flex-col items-center gap-6 pt-4">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">{c.integrationsLabel}</span>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        {[
                          { name: "Booking.com", logo: "https://luxhotelsystem.com/OTAlogos/booking.svg" },
                          { name: "Airbnb", logo: "https://luxhotelsystem.com/OTAlogos/airbnb.png" },
                          { name: "Expedia", logo: "https://luxhotelsystem.com/OTAlogos/expedia.png" },
                          { name: "Agoda", logo: "https://luxhotelsystem.com/OTAlogos/agoda.png" },
                          { name: "Trip.com", logo: "https://luxhotelsystem.com/OTAlogos/tripcom.png" },
                        ].map((ch, i) => (
                            <span key={i} className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white border border-black/5 shadow-sm text-sm font-bold text-black/70">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={ch.logo} alt={ch.name} className="h-5 w-5 object-contain rounded" />
                                {ch.name}
                            </span>
                        ))}
                        <span className="px-5 py-2.5 rounded-full bg-blue-50 border border-blue-100 shadow-sm text-sm font-bold text-blue-600">
                            +95 {lang === 'sq' ? 'më shumë' : 'more'}
                        </span>
                    </div>
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
                  {c.featuresHeader}
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

        {/* Testimonials */}
        <section className="py-24 bg-zinc-50/50 border-y border-black/5">
          <div className="container px-4 mx-auto">
            <div className="flex flex-col items-center text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] text-blue-600 uppercase bg-blue-50/50 rounded-full border border-blue-100 mb-6">
                {c.testimonialsTag}
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold font-headline text-black tracking-tighter max-w-2xl">
                {c.testimonialsTitle}
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {c.testimonials.map((t, i) => (
                <Card key={i} className="p-8 md:p-10 bg-white border-black/5 rounded-[2rem] md:rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col">
                  <p className="text-zinc-600 leading-relaxed text-base md:text-lg font-medium mb-8 flex-grow italic">
                    "{t.quote}"
                  </p>
                  <div className="pt-6 border-t border-black/5">
                    <h4 className="font-bold font-headline text-black">{t.name}</h4>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mt-1">{t.role}</p>
                  </div>
                </Card>
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
                       {c.summaryCards.map((card, i) => (
                         <Card key={i} className={`p-8 md:p-10 bg-zinc-50/50 border-black/[0.03] hover:bg-white transition-all duration-500 rounded-[2.5rem] md:rounded-[3rem] group shadow-sm hover:-translate-y-2 ${i % 2 === 0 ? 'hover:border-blue-200 hover:shadow-[0_40px_80px_-20px_rgba(59,130,246,0.1)]' : 'hover:border-lime-200 hover:shadow-[0_40px_80px_-20px_rgba(163,230,81,0.1)] sm:mt-8'}`}>
                            <div className={`h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white flex items-center justify-center mb-6 md:mb-8 border border-black/5 transition-all shadow-sm ${i % 2 === 0 ? 'group-hover:bg-blue-50 group-hover:text-blue-600' : 'group-hover:bg-lime-50 group-hover:text-lime-600'}`}>
                               {card.icon}
                            </div>
                            <h4 className="font-bold text-xl md:text-2xl mb-2 md:mb-3 text-black tracking-tight">{card.title}</h4>
                            <p className="text-zinc-500 text-xs md:text-sm font-medium">{card.desc}</p>
                         </Card>
                       ))}
                   </div>
                </div>
                <div className="order-1 lg:order-2 flex flex-col items-center lg:items-start text-center lg:text-left">
                   <div className="inline-flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] text-blue-600 uppercase bg-blue-50/50 rounded-full border border-blue-100 mb-8">
                      {c.summaryTag}
                   </div>
                   <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold font-headline mb-8 md:mb-10 tracking-tighter leading-[1.15] text-black">
                      {c.summaryHeading.split(c.summaryHeadingHighlight).map((part, i, arr) => (
                        <span key={i}>
                          {part}
                          {i < arr.length - 1 && <span className="text-blue-600">{c.summaryHeadingHighlight}</span>}
                        </span>
                      ))}
                   </h2>
                   <p className="text-lg md:text-2xl text-zinc-500 leading-relaxed mb-10 md:mb-12 font-medium tracking-tight">
                      {c.summaryText}
                   </p>
                   <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
                     <Button asChild size="lg" className="h-16 md:h-20 px-10 md:px-12 rounded-full font-bold text-lg md:text-xl bg-black text-white hover:bg-zinc-800 transition-all shadow-xl hover:scale-105 active:scale-95 w-full sm:w-auto">
                       <Link href={`/contact?lang=${lang}`}>{c.summaryCta}</Link>
                     </Button>
                     <Link href="https://luxhotelsystem.com" target="_blank" rel="noopener noreferrer" className="font-bold text-black/60 hover:text-blue-600 transition-colors underline underline-offset-4">
                        {c.summaryCtaSecondary}
                     </Link>
                   </div>
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
