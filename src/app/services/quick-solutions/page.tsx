'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Flashlight, 
  Rocket, 
  Monitor, 
  Search, 
  Settings2, 
  Layout, 
  Code2, 
  Smartphone, 
  Zap,
  Globe,
  CheckCircle2,
  TrendingUp,
  Clock
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { FinalCtaSection } from '@/components/sections/final-cta-section';
import { motion } from 'framer-motion';

function QuickSolutionsContent() {
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') === 'sq' ? 'sq' : 'en';

  const content = {
    sq: {
      tag: "Zgjidhje të Shpejta",
      title: "Websajti Juaj në Kohë Rekord, me Cilësi Premium",
      subtitle: "Nga 300 Euro – Websajte Moderne, të Optimizuara për SEO dhe të Gati për Biznes.",
      description: "Në Blue Square AI, ne e kuptojmë se koha është para. Prandaj kemi krijuar një proces efikas që ju jep një prezencë online profesionale pa sakrifikuar kualitetin apo performancën.",
      featuresHeader: "Çfarë Përfitohet?",
      features: [
        {
          title: "Optimizim full SEO",
          desc: "Çdo faqe ndërtohet me rregullat më të fundit të SEO për t'u renditur lart në Google.",
          icon: <Search className="h-6 w-6 text-black" />
        },
        {
          title: "Sistem Menaxhimi (CMS)",
          desc: "Ndryshoni tekstet dhe fotot vetë pa pasur nevojë për programues çdo herë.",
          icon: <Settings2 className="h-6 w-6 text-black" />
        },
        {
          title: "Dizajn Responsive",
          desc: "Websajti juaj do të duket i mrekullueshëm në çdo pajisje: telefon, tablet ose kompjuter.",
          icon: <Smartphone className="h-6 w-6 text-black" />
        },
        {
          title: "Performancë e Lartë",
          desc: "Kodet tona janë të pastra dhe të shpejta, duke garantuar ngarkim të menjëhershëm.",
          icon: <Zap className="h-6 w-6 text-black" />
        }
      ],
      examplesHeader: "Shembuj Suksesi",
      examples: [
        { 
          name: "Discover Albania", 
          logo: "https://firebasestorage.googleapis.com/v0/b/studio-3380920138-3317b.firebasestorage.app/o/logos%2Fdownload.png?alt=media&token=fd453cd6-49c0-46b2-a149-90cd108c9100",
          description: "Një ekosistem i plotë menaxhimi për operatorët turistikë, duke integruar rezervimet në kohë reale, procesimin e sigurt të pagesave dhe menaxhimin e klientëve në një mjedis Next.js me performancë të lartë.",
          image: "https://firebasestorage.googleapis.com/v0/b/studio-3380920138-3317b.firebasestorage.app/o/bluesquare%20AI%20website%2FScreenshot%202026-03-30%20at%202.20.38%E2%80%AFPM.png?alt=media&token=3f1bc2db-f26d-4b27-9582-e214c7e1f700",
          url: "https://discoveralbania.al", 
          category: "Turizëm & Menaxhim",
          features: ["Interface Admin", "Pagesa", "Rezervime", "Klientë", "Next.js", "SEO Efikas", "AI Chat Bot", "Disponueshmëri", "Email-e", "Fatura"]
        },
        { 
          name: "Tirana Escape Room", 
          logo: "https://firebasestorage.googleapis.com/v0/b/studio-3380920138-3317b.firebasestorage.app/o/logos%2Fdownload%20(1).png?alt=media&token=1acc5700-baeb-46c4-9c70-056fb20df885",
          description: "Një motor rezervimi dhe disponueshmërie i krijuar për ndërveprim në kohë reale. Ai automatizon menaxhimin e inventarit, konfirmimet me email dhe gjenerimin e faturave duke ruajtur kualitetin më të lartë të SEO-s.",
          image: "https://firebasestorage.googleapis.com/v0/b/studio-3380920138-3317b.firebasestorage.app/o/bluesquare%20AI%20website%2FScreenshot%202026-03-30%20at%202.20.46%E2%80%AFPM.png?alt=media&token=42e63ec4-fe23-4841-bf3f-9a054157b427",
          url: "https://tiranaescaperoom.com", 
          category: "Argëtim",
          features: ["Disponueshmëri Rezervimesh", "Interface Admin", "Email-e", "Fatura", "SEO Efikas", "Analizë Reviews"]
        },
        { 
          name: "CoolestMenu AI", 
          logo: "https://firebasestorage.googleapis.com/v0/b/studio-3380920138-3317b.firebasestorage.app/o/logos%2Fdownload%20(2).png?alt=media&token=8e05591f-9227-4143-8bbd-f449e0978a69",
          description: "Një SaaS inovativ i fuqizuar nga Inteligjenca Artificiale që transformon menutë fizike në përvoja inteligjente digjitale. Përmban një model vision të personalizuar për gjenerim automatik të menusë dhe algoritme të zgjuara çmimi.",
          image: "https://firebasestorage.googleapis.com/v0/b/studio-3380920138-3317b.firebasestorage.app/o/bluesquare%20AI%20website%2FScreenshot%202026-03-30%20at%202.21.02%E2%80%AFPM.png?alt=media&token=09f5f5b8-a40e-4eb7-bc80-f5289b97db23",
          url: "#", 
          category: "SaaS & AI",
          features: ["SaaS", "Abonime", "AI Vision Model", "Algoritëm Smart", "Sistem Admin", "Monitorim Sistemi"]
        }
      ],
      pricingHeader: "Paketat Tona",
      pricingTag: "Nga 300 Euro",
      pricingDesc: "Një investim i zgjuar për një prani që konverton çdo vizitor në klient.",
      stats: [
        { label: "Koha e Dorëzimit", value: "7 Ditë" },
        { label: "Rezultati SEO", value: "A+" },
        { label: "Mbështetje", value: "Lifetime" }
      ]
    },
    en: {
      tag: "Quick Solutions",
      title: "Your Website in Record Time, Premium Quality",
      subtitle: "Starting from 300 Euro – Modern, SEO-optimized, Business-ready Websites.",
      description: "At Blue Square AI, we understand that time is money. That's why we've created an efficient process that gives you a professional online presence without sacrificing quality or performance.",
      featuresHeader: "What's Included?",
      features: [
        {
          title: "Full SEO Optimization",
          desc: "Every page is built with the latest SEO rules to rank high on Google.",
          icon: <Search className="h-6 w-6 text-black" />
        },
        {
          title: "CMS Management",
          desc: "Change texts and photos yourself without needing a programmer every time.",
          icon: <Settings2 className="h-10 w-10 text-black" />
        },
        {
          title: "Responsive Design",
          desc: "Your website will look amazing on every device: phone, tablet, or desktop.",
          icon: <Smartphone className="h-6 w-6 text-black" />
        },
        {
          title: "High Performance",
          desc: "Our code is clean and fast, guaranteeing instant loading times.",
          icon: <Zap className="h-6 w-6 text-black" />
        }
      ],
      whyHeader: "Why Choose Quick Solutions?",
      whyText: "In a world that moves fast, we help your business keep up. Our quick solutions are designed to get you online in record time, with a focus on results and style.",
      stats: [
        { label: "Delivery Time", value: "7 Days" },
        { label: "SEO Result", value: "A+" },
        { label: "Support", value: "Lifetime" }
      ],
      examplesHeader: "Success Examples",
      examples: [
        { 
          name: "Discover Albania", 
          logo: "https://firebasestorage.googleapis.com/v0/b/studio-3380920138-3317b.firebasestorage.app/o/logos%2Fdownload.png?alt=media&token=fd453cd6-49c0-46b2-a149-90cd108c9100",
          description: "A complete management ecosystem for tourism operators, integrating real-time bookings, secure payment processing, and customer relationship management in a high-performance Next.js environment.",
          image: "https://firebasestorage.googleapis.com/v0/b/studio-3380920138-3317b.firebasestorage.app/o/bluesquare%20AI%20website%2FScreenshot%202026-03-30%20at%202.20.38%E2%80%AFPM.png?alt=media&token=3f1bc2db-f26d-4b27-9582-e214c7e1f700",
          url: "https://discoveralbania.al", 
          category: "Tourism & Management",
          features: ["Admin Interface", "Payments", "Bookings", "Customers", "Next.js", "SEO Efficient", "AI Chat Bot", "Availability", "Emails", "Invoices"]
        },
        { 
          name: "Tirana Escape Room", 
          logo: "https://firebasestorage.googleapis.com/v0/b/studio-3380920138-3317b.firebasestorage.app/o/logos%2Fdownload%20(1).png?alt=media&token=1acc5700-baeb-46c4-9c70-056fb20df885",
          description: "A seamless booking and availability engine designed for real-time interaction. It automates inventory management, email confirmations, and invoice generation while maintaining top-tier SEO performance.",
          image: "https://firebasestorage.googleapis.com/v0/b/studio-3380920138-3317b.firebasestorage.app/o/bluesquare%20AI%20website%2FScreenshot%202026-03-30%20at%202.20.46%E2%80%AFPM.png?alt=media&token=42e63ec4-fe23-4841-bf3f-9a054157b427",
          url: "https://tiranaescaperoom.com", 
          category: "Entertainment",
          features: ["Booking Availability", "Admin Interface", "Emails", "Invoices", "SEO Efficient", "Review Analysis"]
        },
        { 
          name: "CoolestMenu AI", 
          logo: "https://firebasestorage.googleapis.com/v0/b/studio-3380920138-3317b.firebasestorage.app/o/logos%2Fdownload%20(2).png?alt=media&token=8e05591f-9227-4143-8bbd-f449e0978a69",
          description: "A disruptive AI-powered SaaS that transforms physical menus into intelligent digital experiences. It features a custom vision model for automatic menu generation, smart pricing algorithms, and comprehensive monitoring.",
          image: "https://firebasestorage.googleapis.com/v0/b/studio-3380920138-3317b.firebasestorage.app/o/bluesquare%20AI%20website%2FScreenshot%202026-03-30%20at%202.21.02%E2%80%AFPM.png?alt=media&token=09f5f5b8-a40e-4eb7-bc80-f5289b97db23",
          url: "#", 
          category: "SaaS & AI",
          features: ["SaaS", "Subscriptions", "AI Vision Model", "Smart Algorithm", "Admin System", "Monitoring"]
        }
      ],
      pricingHeader: "Our Packages",
      pricingTag: "From 300 Euro",
      pricingDesc: "A smart investment for a presence that converts every visitor into a customer.",
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
                alt="Quick Solutions Wallpaper"
                fill
                className="object-cover scale-110"
                priority
             />
             <div className="absolute inset-0 bg-black/40" />
             <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-white to-transparent" />
          </motion.div>

          <div className="container px-4 mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="text-left flex flex-col items-start translate-z-0">
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
                <div className="flex flex-col sm:flex-row gap-6 md:gap-8">
                  <Button size="lg" asChild className="h-16 md:h-20 px-10 md:px-12 w-full sm:w-auto rounded-full font-bold text-xl bg-white text-black hover:bg-zinc-100 shadow-2xl transition-all hover:scale-105 active:scale-95">
                    <Link href={`/contact?lang=${lang}`}>{lang === 'sq' ? 'Fillo Projektin Tënd' : 'Start Your Project'}</Link>
                  </Button>
                  <div className="flex items-center gap-3 text-zinc-400 font-bold uppercase tracking-[0.2em] text-[10px] group transition-all">
                     <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all shadow-sm">
                        <Clock className="h-5 w-5" />
                     </div>
                     <span className="group-hover:text-white transition-colors">{c.stats[0].value} {lang === 'sq' ? 'Dorëzim' : 'Delivery'}</span>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <div className="relative z-10 aspect-square md:aspect-video rounded-[2.5rem] md:rounded-[4rem] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl transition-all duration-700 group-hover:bg-white/10 group-hover:border-white/20 group-hover:shadow-[0_60px_100px_-20px_rgba(255,255,255,0.05)]">
                   <Image 
                      src="https://static.vecteezy.com/system/resources/previews/041/306/253/non_2x/ai-generated-3d-abstract-colorful-glass-3d-rendering-free-png.png"
                      alt="Quick Solutions Illustration"
                      fill
                      className="object-contain p-8 md:p-12 transition-transform duration-1000 group-hover:scale-105"
                      priority
                   />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-white text-black relative overflow-hidden border-y border-black/5">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-500/[0.02] rounded-full blur-[150px] pointer-events-none" />
          <div className="container px-4 mx-auto relative z-10">
             <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-16 mb-24">
                <div className="max-w-3xl">
                   <div className="inline-flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] text-blue-600 uppercase bg-blue-50/50 rounded-full border border-blue-100 mb-6">
                     {lang === 'sq' ? 'Përfitimet' : 'Benefits'}
                   </div>
                   <h2 className="text-3xl md:text-5xl font-extrabold font-headline mb-8 tracking-tighter text-black">
                     {c.featuresHeader}
                   </h2>
                   <p className="text-2xl text-zinc-500 leading-relaxed font-medium tracking-tight">
                     {c.description}
                   </p>
                </div>
                <div className="p-8 md:p-10 bg-black text-white rounded-[2.5rem] md:rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] transform hover:scale-105 transition-all duration-500 border border-white/10 w-full lg:w-auto text-center">
                   <span className="text-white font-extrabold text-4xl md:text-5xl block mb-2 md:mb-3 tracking-tighter">{c.pricingTag}</span>
                   <span className="text-zinc-500 uppercase tracking-[0.2em] font-bold text-[10px]">Starting Price</span>
                </div>
             </div>

             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {c.features.map((f, i) => (
                   <div key={i} className="group p-10 md:p-12 bg-zinc-50/50 border border-black/[0.03] rounded-[2.5rem] md:rounded-[3.5rem] hover:bg-white hover:border-blue-200 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(59,130,246,0.1)] hover:-translate-y-2">
                     <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center text-black mb-10 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-500 shadow-sm border border-black/5">
                        {f.icon}
                     </div>
                     <h3 className="text-2xl font-bold mb-4 font-headline tracking-tight text-black">{f.title}</h3>
                     <p className="text-zinc-500 font-medium leading-relaxed tracking-tight">{f.desc}</p>
                  </div>
                ))}
             </div>
          </div>
        </section>

        {/* Examples Section */}
        <section className="py-32 bg-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-lime-400/[0.03] rounded-full blur-[120px] pointer-events-none" />
           <div className="container px-4 mx-auto relative z-10">
              <div className="text-center mb-24 max-w-2xl mx-auto">
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] text-blue-600 uppercase bg-blue-50/50 rounded-full border border-blue-100 mb-6">
                    {lang === 'sq' ? 'Projekte Live' : 'Live Projects'}
                 </div>
                  <h2 className="text-3xl md:text-6xl font-extrabold font-headline text-black mb-8 md:mb-10 tracking-tighter leading-tight">
                    {c.examplesHeader}
                  </h2>
                 <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-lime-500 rounded-full mx-auto" />
              </div>

              <div className="flex flex-col gap-32 md:gap-40 max-w-7xl mx-auto">
                 {c.examples.map((ex, i) => (
                    <div key={i} className="flex flex-col gap-12 lg:gap-16 transition-all duration-1000">
                      {/* Image Preview Container - Expanded for Visual Impact */}
                      <div className="w-full group relative px-4 md:px-0">
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/5 to-lime-500/5 rounded-[3.5rem] md:rounded-[5rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <Card className="relative aspect-[21/9] md:aspect-[21/10] overflow-hidden rounded-[2.5rem] md:rounded-[4rem] border-black/[0.05] shadow-2xl transition-all duration-700 group-hover:shadow-blue-500/10 group-hover:-translate-y-3 bg-zinc-50">
                           <Image 
                              src={ex.image}
                              alt={ex.name}
                              fill
                              className="object-cover object-top transition-transform duration-1000 group-hover:scale-[1.03]"
                              priority={i === 0}
                           />
                           <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[2.5rem] md:rounded-[4rem]" />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex flex-col justify-end p-8 md:p-16">
                              <p className="text-white/60 font-black uppercase tracking-[0.3em] text-[10px] mb-3">{ex.category}</p>
                              <h3 className="text-white text-3xl md:text-5xl font-extrabold font-headline tracking-tighter">{ex.name}</h3>
                           </div>
                        </Card>
                      </div>

                      {/* Content Block - Centered and Refined */}
                      <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center px-6">
                         <div className="inline-flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] text-blue-600 uppercase bg-blue-50/50 rounded-full border border-blue-100 mb-8">
                            {ex.category}
                         </div>
                         <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-10 mb-8 w-full">
                            {ex.logo && (
                               <div className="relative h-20 w-48 md:h-24 md:w-56 flex-shrink-0">
                                  <Image 
                                     src={ex.logo}
                                     alt={`${ex.name} Logo`}
                                     fill
                                     className="object-contain"
                                  />
                               </div>
                            )}
                            <h3 className="text-3xl md:text-5xl lg:text-7xl font-extrabold font-headline text-black tracking-tighter leading-[1.1]">
                               {ex.name}
                            </h3>
                         </div>
                         <p className="text-xl md:text-2xl text-zinc-500 leading-relaxed mb-12 font-medium tracking-tight">
                            {ex.description}
                         </p>
                         
                         <div className="flex flex-wrap justify-center gap-2 mb-14">
                            {ex.features.map((feature, idx) => (
                               <span 
                                  key={idx} 
                                  className="px-5 py-2.5 bg-zinc-50 border border-black/[0.03] rounded-full text-[10px] md:text-xs font-bold text-zinc-600 hover:border-blue-100 hover:text-blue-600 transition-colors shadow-sm"
                               >
                                  {feature}
                               </span>
                            ))}
                         </div>

                      </div>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Closing Pricing Section */}
        <section className="py-32 bg-white">
           <div className="container px-4 mx-auto">
              <div className="grid lg:grid-cols-2 gap-16 md:gap-24 items-center bg-black rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-32 relative overflow-hidden shadow-[0_60px_100px_-20px_rgba(0,0,0,0.3)]">
                 <div className="relative z-10">
                    <h2 className="text-3xl md:text-6xl font-extrabold font-headline mb-8 md:mb-12 tracking-tighter text-white leading-tight">
                       {c.pricingHeader}
                    </h2>
                    <p className="text-lg md:text-2xl text-zinc-400 mb-10 md:mb-14 max-w-lg leading-relaxed font-medium tracking-tight">
                       {c.pricingDesc}
                    </p>
                    <div className="space-y-4 md:space-y-6 mb-12 md:mb-16">
                       <div className="flex items-center gap-4 md:gap-6 group">
                          <div className="h-10 w-10 md:h-12 md:w-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:bg-blue-500 transition-colors">
                             <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-white group-hover:text-black" />
                          </div>
                          <span className="font-bold text-white text-base md:text-lg tracking-tight">Lifetime Technical Support</span>
                       </div>
                       <div className="flex items-center gap-4 md:gap-6 group">
                          <div className="h-10 w-10 md:h-12 md:w-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:bg-lime-400 transition-colors">
                             <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-white group-hover:text-black" />
                          </div>
                          <span className="font-bold text-white text-base md:text-lg tracking-tight">High-Speed Cloud Hosting</span>
                       </div>
                    </div>
                    <Button size="lg" asChild className="h-16 md:h-20 px-10 md:px-16 w-full sm:w-auto rounded-full font-bold text-xl md:text-2xl bg-white text-black hover:bg-zinc-100 transition-all hover:scale-105 active:scale-95 shadow-xl hover:shadow-white/10">
                      <Link href={`/contact?lang=${lang}`}>{lang === 'sq' ? 'Merr një Ofertë' : 'Get a Free Quote'}</Link>
                    </Button>
                 </div>
                 <div className="relative z-10">
                    <div className="grid grid-cols-2 gap-8 text-center bg-white/[0.03] backdrop-blur-2xl p-16 rounded-[3.5rem] border border-white/10 shadow-inner">
                       {c.stats.map((s, i) => (
                         <div key={i} className="flex flex-col items-center">
                            <span className="text-4xl md:text-5xl font-extrabold text-white mb-4 font-headline tracking-tighter text-blue-400">{s.value}</span>
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] leading-tight">{s.label}</span>
                         </div>
                       ))}
                    </div>
                 </div>
                 
                 {/* Decorative elements */}
                 <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                 <div className="absolute bottom-0 left-0 w-96 h-96 bg-lime-400/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
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
