'use client';

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
  ArrowUpRight,
  TrendingUp,
  Clock
} from "lucide-react";
import Link from "next/link";
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { FinalCtaSection } from '@/components/sections/final-cta-section';

export default function QuickSolutionsPage() {
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
        { name: "Discover Albania", url: "https://discoveralbania.al", category: "Turizëm" },
        { name: "Tirana Escape Room", url: "https://tiranaescaperoom.com", category: "Argëtim" }
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
          icon: <Settings2 className="h-6 w-6 text-black" />
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
      examplesHeader: "Success Examples",
      examples: [
        { name: "Discover Albania", url: "https://discoveralbania.al", category: "Tourism" },
        { name: "Tirana Escape Room", url: "https://tiranaescaperoom.com", category: "Entertainment" }
      ],
      pricingHeader: "Our Packages",
      pricingTag: "From 300 Euro",
      pricingDesc: "A smart investment for a presence that converts every visitor into a customer.",
      stats: [
        { label: "Delivery Time", value: "7 Days" },
        { label: "SEO Result", value: "A+" },
        { label: "Support", value: "Lifetime" }
      ]
    }
  };

  const c = content[lang];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header lang={lang} />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-32 pb-32 overflow-hidden bg-white text-black text-center">
          <div className="container px-4 mx-auto relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 mb-10 text-[10px] font-bold tracking-[0.2em] text-blue-600 uppercase bg-blue-50/50 rounded-full border border-blue-100 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              {c.tag}
            </div>
            
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-extrabold font-headline text-black mb-8 md:mb-10 tracking-tighter leading-[1.1] md:leading-[1.05]">
              {c.title}
            </h1>
            
            <p className="text-lg md:text-2xl lg:text-3xl text-zinc-500 mb-10 md:mb-14 leading-relaxed max-w-3xl mx-auto font-medium tracking-tight">
              {c.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-8">
              <Button size="lg" className="h-16 md:h-20 px-10 md:px-16 w-full sm:w-auto rounded-full font-bold text-xl md:text-2xl bg-black text-white hover:bg-zinc-800 shadow-2xl transition-all hover:scale-105 active:scale-95">
                {lang === 'sq' ? 'Fillo Projektin Tënd' : 'Start Your Project'}
              </Button>
              <div className="flex items-center gap-3 text-zinc-400 font-bold uppercase tracking-[0.2em] text-[10px] group transition-all">
                 <div className="h-10 w-10 rounded-full bg-zinc-50 flex items-center justify-center border border-black/5 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all shadow-sm">
                    <Clock className="h-5 w-5" />
                 </div>
                 <span className="group-hover:text-black transition-colors">{c.stats[0].value} {lang === 'sq' ? 'Dorëzim' : 'Delivery'}</span>
              </div>
            </div>
          </div>
          
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f605_1px,transparent_1px),linear-gradient(to_bottom,#3b82f605_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#fff_70%,transparent_100%)] pointer-events-none opacity-100" />
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

              <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                 {c.examples.map((ex, i) => (
                   <Link key={i} href={ex.url} target="_blank" className="group">
                    <div className="relative aspect-[16/10] bg-zinc-50/50 rounded-[2.5rem] md:rounded-[4rem] overflow-hidden border border-black/[0.03] group-hover:border-blue-200 transition-all duration-700 group-hover:shadow-[0_60px_100px_-20px_rgba(59,130,246,0.1)] group-hover:-translate-y-2">
                         <div className="absolute inset-0 flex items-center justify-center p-12 md:p-16 transition-transform duration-1000 group-hover:scale-105">
                            <Monitor className="h-full w-full text-blue-500/[0.02]" />
                            <span className="absolute text-2xl md:text-3xl font-extrabold font-headline text-black/10 uppercase tracking-[0.2em] transition-all duration-700 group-hover:text-blue-500 group-hover:text-opacity-20">{ex.name}</span>
                         </div>
                         <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10 p-6 md:p-8 flex items-center justify-between bg-white/80 backdrop-blur-xl rounded-[2rem] md:rounded-[2.5rem] border border-black/5 shadow-lg shadow-black/[0.02] group-hover:bottom-8 md:group-hover:bottom-12 transition-all duration-500">
                            <div>
                               <span className="text-[9px] md:text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mb-1 md:mb-2 block">{ex.category}</span>
                               <span className="text-xl md:text-2xl font-bold text-black tracking-tight">{ex.name}</span>
                            </div>
                            <div className="h-12 w-12 md:h-14 md:w-14 bg-black rounded-full flex items-center justify-center text-white group-hover:bg-blue-600 transition-all duration-500 shadow-lg group-hover:rotate-45">
                               <ArrowUpRight className="h-5 w-5 md:h-6 md:w-6" />
                            </div>
                         </div>
                      </div>
                   </Link>
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
                 <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15)_0%,transparent_60%)] pointer-events-none" />
                 <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(163,230,81,0.05)_0%,transparent_60%)] pointer-events-none" />
              </div>
           </div>
        </section>

        <FinalCtaSection lang={lang} />
      </main>
      <Footer lang={lang} />
    </div>
  );
}
