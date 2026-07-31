'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Database,
  LayoutGrid,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Clock,
  FileUp,
  Users
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { FinalCtaSection } from '@/components/sections/final-cta-section';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

function QuickSolutionsContent() {
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') === 'sq' ? 'sq' : 'en';
  const [activeModel, setActiveModel] = useState(0);

  const content = {
    sq: {
      tag: "Multisystem",
      title: "Biznesi Yt, Sistemi Yt.",
      subtitle: "Jo një program i gatshëm ku futesh me forcë. Fillo me një shabllon — qera makinash, dyqan, klinikë dentare — dhe përshtat çdo tabelë, fushë e lidhje sipas mënyrës si punon biznesi yt.",
      heroPills: ["10 lloje fushash", "5 aplikacione gati", "9 modele biznesi"],
      ctaPrimary: "Krijo Hapësirën Tënde",
      ctaSecondary: "Shiko një Shembull",
      stats: [
        { label: "Lloje Fushash", value: "10" },
        { label: "Aplikacione Gati", value: "5" },
        { label: "Modele Biznesi", value: "9" }
      ],
      featuresHeader: "Karakteristikat Kryesore",
      features: [
        {
          title: "Themeli: Tabela të Personalizuara",
          desc: "10 lloje fushash — Tekst, Numër, Po/Jo, Datë, Orë, Linke, Lista, ID Automatike, Formula dhe Skedarë. Lidhje reale mes tabelave dhe formula që llogariten vetë.",
          icon: <Database className="h-6 w-6 text-black" />
        },
        {
          title: "5 Aplikacione Gati për Instalim",
          desc: "Formularë, Kalendar, Grafikë, WhatsApp dhe Shënime — kthe çdo tabelë në mjet të gatshëm pune, pa kod shtesë.",
          icon: <LayoutGrid className="h-6 w-6 text-black" />
        },
        {
          title: "Kontroll dhe Siguri",
          desc: "Skemë e veçantë databaze për çdo llogari, hapësira pune sipas dege a aktiviteti, dhe leje të përcaktuara për çdo përdorues në çdo tabelë.",
          icon: <ShieldCheck className="h-6 w-6 text-black" />
        },
        {
          title: "API me Çelësa të Sigurt",
          desc: "Kontrata OpenAPI të gjeneruara automatikisht, shkrime të sigurta pa dublikime, dhe histori e plotë e çdo çelësi API.",
          icon: <KeyRound className="h-6 w-6 text-black" />
        }
      ],
      whyHeader: "Pse Multisystem?",
      whyText: "Platformë menaxhimi biznesi, ndërtuar posaçërisht për tregun shqiptar. Sistemi është yti, edhe nën kapak — pa abonim të huaj, pa gjuhë të huaj, pa varësi nga dikush tjetër.",
      modelsTag: "Modelet e Biznesit",
      modelsTitle: "Fillo me një Shabllon të Gatshëm",
      models: [
        { name: "Qera Makinash", desc: "Ndiq flotën, rezervimet dhe kthimet e makinave në kohë reale.", img: "car-rental.jpg" },
        { name: "Dyqan", desc: "Menaxho stokun, shitjet dhe klientët nga një tabelë e vetme.", img: "retail-shop.jpg" },
        { name: "Prona me Qira", desc: "Kontrollo kontratat, qiratë dhe mirëmbajtjen për çdo pronë.", img: "property-rentals.jpg" },
        { name: "Sallon Bukurie", desc: "Planifiko takimet dhe menaxho klientët me kalendar të integruar.", img: "beauty-salon.jpg" },
        { name: "Palestër", desc: "Gjurmo abonimet, hyrjet dhe planet e stërvitjes së anëtarëve.", img: "gym.jpg" },
        { name: "Agjenci Udhëtimi", desc: "Organizo ofertat, rezervimet dhe klientët për çdo destinacion.", img: "agency.jpg" },
        { name: "Restorant", desc: "Menaxho porositë, tavolinat dhe inventarin e kuzhinës çdo ditë.", img: "restaurant.jpg" },
        { name: "Klinikë Dentare", desc: "Planifiko pacientët, historikun mjekësor dhe pagesat pa telashe.", img: "dental-clinic.jpg" },
        { name: "Fillo Bosh", desc: "Ndërto tabelat e tua nga zero, sipas mënyrës si punon.", img: "blank.jpg" },
      ],
      comparisonTag: "Krahasim",
      comparisonTitle: "Multisystem kundrejt Excel, Airtable, Podio",
      comparisonColumns: ["Multisystem", "Excel", "Airtable", "Podio"],
      comparisonRows: [
        { label: "Databazë e veçantë për çdo klient", values: [true, false, false, false] },
        { label: "Integrim WhatsApp pa shtesa", values: [true, false, false, false] },
        { label: "Mbështetje e plotë në Shqip", values: [true, true, false, false] },
        { label: "Suport dhe faturim vendas", values: [true, false, false, false] },
      ],
      summaryTag: "Ndërtim i Personalizuar",
      summaryCards: [
        { title: "1 Ditë Pune", desc: "Sistemi ndërtohet brenda një dite pune biznesi.", icon: <Clock className="h-5 w-5 md:h-6 md:w-6 text-black" /> },
        { title: "Import nga Excel", desc: "Importo direkt të dhënat ekzistuese nga Excel.", icon: <FileUp className="h-5 w-5 md:h-6 md:w-6 text-black" /> },
        { title: "Ekip i Konfiguruar", desc: "Vendosim ekipin tënd me leje të gatshme për çdo anëtar.", icon: <Users className="h-5 w-5 md:h-6 md:w-6 text-black" /> },
        { title: "Pa Varësi të Vazhdueshme", desc: "Nuk ke nevojë të mbështetesh vazhdimisht te ekipi ynë i suportit.", icon: <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-black" /> },
      ],
      summaryHeading: "Sistemi është yti, edhe nën kapak.",
      summaryHeadingHighlight: "yti",
      summaryText: "Ndërtuam Multisystem për t'iu përshtatur çdo biznesi shqiptar — nga qera makinash te klinika dentare — pa qenë kurrë i kyçur në një zgjidhje të ngurtë.",
      summaryCta: "Fol me Ne",
      summaryCtaSecondary: "Ose Fillo Vetë Falas",
    },
    en: {
      tag: "Multisystem",
      title: "Your Business, Your System.",
      subtitle: "Not a pre-made program you have to force your business into. Start with a template — car rental, retail shop, dental clinic — and customize every table, field, and relationship the way your business actually works.",
      heroPills: ["10 field types", "5 ready apps", "9 business models"],
      ctaPrimary: "Create Your Space",
      ctaSecondary: "See an Example",
      stats: [
        { label: "Field Types", value: "10" },
        { label: "Ready Apps", value: "5" },
        { label: "Business Models", value: "9" }
      ],
      featuresHeader: "Key Features",
      features: [
        {
          title: "Foundation: Custom Tables",
          desc: "10 field types — Text, Number, Yes/No, Date, Time, Links, Lists, Auto ID, Formula, and Files. Real relationships between tables and formulas that self-calculate.",
          icon: <Database className="h-6 w-6 text-black" />
        },
        {
          title: "5 Ready-to-Install Applications",
          desc: "Forms, Calendar, Charts, WhatsApp, and Notes — turn any table into a ready-made work tool, with no extra code.",
          icon: <LayoutGrid className="h-6 w-6 text-black" />
        },
        {
          title: "Control and Security",
          desc: "A separate database schema for every account, workspaces by branch or activity, and defined permissions for every user on every table.",
          icon: <ShieldCheck className="h-6 w-6 text-black" />
        },
        {
          title: "API with Secure Keys",
          desc: "Auto-generated OpenAPI contracts, safe writes without duplicates, and a complete history of every API key.",
          icon: <KeyRound className="h-6 w-6 text-black" />
        }
      ],
      whyHeader: "Why Multisystem?",
      whyText: "A business management platform built specifically for the Albanian market. The system is yours, even under the hood — no foreign subscription, no foreign language, no dependency on anyone else.",
      modelsTag: "Business Models",
      modelsTitle: "Start With a Ready-Made Template",
      models: [
        { name: "Car Rental", desc: "Track your fleet, bookings, and returns in real time.", img: "car-rental.jpg" },
        { name: "Retail Shop", desc: "Manage inventory, sales, and customers from a single table.", img: "retail-shop.jpg" },
        { name: "Property Rentals", desc: "Control leases, rent collection, and maintenance for every property.", img: "property-rentals.jpg" },
        { name: "Beauty Salon", desc: "Schedule appointments and manage clients with a built-in calendar.", img: "beauty-salon.jpg" },
        { name: "Gym", desc: "Track memberships, check-ins, and member training plans.", img: "gym.jpg" },
        { name: "Travel Agency", desc: "Organize packages, bookings, and clients for every destination.", img: "agency.jpg" },
        { name: "Restaurant", desc: "Manage orders, tables, and kitchen inventory every single day.", img: "restaurant.jpg" },
        { name: "Dental Clinic", desc: "Schedule patients, medical history, and payments without the hassle.", img: "dental-clinic.jpg" },
        { name: "Start Blank", desc: "Build your own tables from scratch, your way.", img: "blank.jpg" },
      ],
      comparisonTag: "Comparison",
      comparisonTitle: "Multisystem vs. Excel, Airtable, Podio",
      comparisonColumns: ["Multisystem", "Excel", "Airtable", "Podio"],
      comparisonRows: [
        { label: "Separate database per client", values: [true, false, false, false] },
        { label: "WhatsApp integration, no add-ons", values: [true, false, false, false] },
        { label: "Full Albanian language support", values: [true, true, false, false] },
        { label: "Local support & billing", values: [true, false, false, false] },
      ],
      summaryTag: "Custom Build",
      summaryCards: [
        { title: "1 Business Day", desc: "The system is built within one business day.", icon: <Clock className="h-5 w-5 md:h-6 md:w-6 text-black" /> },
        { title: "Import from Excel", desc: "Import your existing data directly from Excel.", icon: <FileUp className="h-5 w-5 md:h-6 md:w-6 text-black" /> },
        { title: "Configured Team", desc: "We set up your team with permissions ready for every member.", icon: <Users className="h-5 w-5 md:h-6 md:w-6 text-black" /> },
        { title: "No Ongoing Dependency", desc: "No need to keep relying on our support team afterward.", icon: <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-black" /> },
      ],
      summaryHeading: "The system is yours, even under the hood.",
      summaryHeadingHighlight: "yours",
      summaryText: "We built Multisystem to adapt to any Albanian business — from car rentals to dental clinics — without ever locking you into a rigid solution.",
      summaryCta: "Talk to Us",
      summaryCtaSecondary: "Or Start Free Yourself",
    }
  };

  const c = content[lang];

  return (
    <div className="flex flex-col min-h-screen bg-white">
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
                src="/background/wallpaper-dark1.jpg"
                alt="Multisystem Wallpaper"
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
                    <Link href="https://multisystem.al/signup" target="_blank" rel="noopener noreferrer">
                      {c.ctaPrimary}
                      <ChevronRight className="ml-1 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-14 md:h-16 px-8 md:px-10 rounded-full font-bold text-base md:text-lg bg-white/5 text-white border-white/20 hover:bg-white/10 hover:text-white transition-all w-full sm:w-auto">
                    <Link href="https://multisystem.al" target="_blank" rel="noopener noreferrer">{c.ctaSecondary}</Link>
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
                    <div className="aspect-[1024/555] flex items-center justify-center overflow-hidden relative rounded-[1.5rem] md:rounded-[2.5rem]">
                       <Image
                          src="https://multisystem.al/opengraph-image.jpeg"
                          alt="Multisystem Platform Preview"
                          fill
                          className="object-cover transition-transform duration-1000 group-hover:scale-105"
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

        {/* Business Models Showcase */}
        <section className="py-24 bg-zinc-50/50 border-b border-black/5">
           <div className="container px-4 mx-auto">
             <div className="max-w-6xl mx-auto space-y-16">
                <div className="flex flex-col items-center text-center">
                   <div className="inline-flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] text-blue-600 uppercase bg-blue-50/50 rounded-full border border-blue-100 mb-6">
                     {c.modelsTag}
                   </div>
                   <h2 className="text-3xl md:text-5xl font-extrabold font-headline text-black tracking-tighter">
                     {c.modelsTitle}
                   </h2>
                </div>
                <div className="grid lg:grid-cols-[300px_1fr] gap-4 lg:gap-8 items-stretch">
                    {/* Model selector */}
                    <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
                        {c.models.map((m, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveModel(i)}
                            className={cn(
                              "flex-shrink-0 lg:flex-shrink lg:w-full text-left px-5 py-4 rounded-2xl border transition-all duration-300 whitespace-nowrap lg:whitespace-normal",
                              activeModel === i
                                ? "bg-black text-white border-black shadow-lg"
                                : "bg-white text-black/60 border-black/5 hover:border-blue-200 hover:bg-blue-50/40 hover:text-black"
                            )}
                          >
                            <span className="font-bold text-sm md:text-base tracking-tight">{m.name}</span>
                          </button>
                        ))}
                    </div>

                    {/* Live preview */}
                    <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-black/5 min-h-[380px] md:min-h-[480px]">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={activeModel}
                            initial={{ opacity: 0, scale: 1.04 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute inset-0"
                          >
                            <Image
                                src={`https://multisystem.al/templates/${c.models[activeModel].img}`}
                                alt={c.models[activeModel].name}
                                fill
                                className="object-cover"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-14">
                               <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/70 text-[10px] font-bold uppercase tracking-widest mb-5 backdrop-blur-sm">
                                 {String(activeModel + 1).padStart(2, '0')} / {String(c.models.length).padStart(2, '0')}
                               </span>
                               <h3 className="text-3xl md:text-5xl font-extrabold font-headline text-white tracking-tighter mb-3 leading-tight">
                                 {c.models[activeModel].name}
                               </h3>
                               <p className="text-white/70 text-base md:text-lg max-w-lg font-medium leading-relaxed">
                                 {c.models[activeModel].desc}
                               </p>
                            </div>
                          </motion.div>
                        </AnimatePresence>
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

        {/* Comparison Table */}
        <section className="py-24 bg-zinc-50/50 border-y border-black/5">
          <div className="container px-4 mx-auto">
            <div className="flex flex-col items-center text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] text-blue-600 uppercase bg-blue-50/50 rounded-full border border-blue-100 mb-6">
                {c.comparisonTag}
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold font-headline text-black tracking-tighter max-w-3xl">
                {c.comparisonTitle}
              </h2>
            </div>
            <div className="max-w-4xl mx-auto overflow-x-auto">
              <Card className="border-black/5 rounded-[2rem] shadow-sm overflow-hidden bg-white min-w-[560px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-black/5">
                      <th className="p-5 md:p-6 text-xs font-bold text-zinc-400 uppercase tracking-widest"></th>
                      {c.comparisonColumns.map((col, i) => (
                        <th key={i} className={`p-5 md:p-6 text-center text-sm md:text-base font-extrabold tracking-tight ${i === 0 ? 'text-blue-600' : 'text-zinc-500'}`}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {c.comparisonRows.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-zinc-50/50" : ""}>
                        <td className="p-5 md:p-6 text-sm md:text-base font-semibold text-black/80">{row.label}</td>
                        {row.values.map((val, j) => (
                          <td key={j} className="p-5 md:p-6 text-center">
                            {val ? (
                              <CheckCircle2 className={`h-5 w-5 md:h-6 md:w-6 inline-block ${j === 0 ? 'text-blue-600' : 'text-lime-500'}`} />
                            ) : (
                              <XCircle className="h-5 w-5 md:h-6 md:w-6 inline-block text-zinc-300" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
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
                     <Link href="https://multisystem.al/signup" target="_blank" rel="noopener noreferrer" className="font-bold text-black/60 hover:text-blue-600 transition-colors underline underline-offset-4">
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

export default function QuickSolutionsPage() {
  return (
    <Suspense fallback={null}>
      <QuickSolutionsContent />
    </Suspense>
  );
}
