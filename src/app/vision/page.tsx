'use client';

import { Suspense } from 'react';
import NextImage from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Target, 
  Cpu, 
  Shield, 
  Users, 
  ArrowRight,
  Code2,
  Sparkles,
  Zap,
  Globe
} from "lucide-react";
import Link from "next/link";
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { FinalCtaSection } from '@/components/sections/final-cta-section';
import { motion } from 'framer-motion';

function VisionContent() {
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') === 'sq' ? 'sq' : 'en';

  const content = {
    sq: {
      tag: "Vizioni & Misioni",
      title: "Ndërtojmë të Ardhmen, me Efikasitet",
      subtitle: "Themeluar në vitin 2025 me misionin për të revolucionarizuar mënyrën se si ndërtohet teknologjia.",
      aboutTitle: "Historia Jonë",
      aboutText: "Ndërtojmë teknologji të sigurt, në mënyrën më efikase.",
      strategyTitle: "Strategjia AI-First",
      strategyText: "Blue Square AI lindi në vitin 2025 me një vizion të qartë: integrimin e Inteligjencës Artificiale në pothuajse çdo hap të procesit – nga gjetja e klientëve deri te ndërtimi i plotë i sistemeve nga themeli me një ekip ekstremisht efikas.",
      teamTitle: "Udhëheqja Jonë",
      teamMember: "Daniel Frrokaj",
      teamRole: "Bashkë-themelues & Kryeinxhinier",
      teamDesc: "Danieli sjell një përvojë të gjerë në trajnimin e modeleve të AI dhe ndërtimin e aplikacioneve full-stack. Pasioni i tij është krijimi i sistemeve që ndihmojnë bizneset të rriten në mënyrë eksponenciale dhe efikase.",
      features: [
        {
          title: "Siguri Maksimale",
          desc: "Aplikacione të ndërtuara me protokolle sigurie të nivelit të lartë që në rreshtin e parë të kodit.",
          icon: <Shield className="h-6 w-6" />
        },
        {
          title: "Efikasitet AI",
          desc: "Automatizim i plotë i proceseve të zhvillimit për rezultate më të shpejta.",
          icon: <Cpu className="h-6 w-6" />
        },
        {
          title: "Ekip Modern",
          desc: "Specialistë që zotërojnë teknologjitë më të fundit të AI dhe web-it.",
          icon: <Users className="h-6 w-6" />
        }
      ]
    },
    en: {
      tag: "Vision & Mission",
      title: "Building the Future, Efficiently",
      subtitle: "Established in 2025 with a mission to revolutionize how technology is built.",
      aboutTitle: "Our Story",
      aboutText: "Building secure technology, the most efficient way possible.",
      strategyTitle: "AI-First Strategy",
      strategyText: "Blue Square AI was founded in 2025 with a clear vision: integrating Artificial Intelligence into almost every step of the pipeline – from identifying customers to building systems from the ground up with an extremely efficient team.",
      teamTitle: "Our Leadership",
      teamMember: "Daniel Frrokaj",
      teamRole: "Co-founder & Lead Engineer",
      teamDesc: "Daniel Frrokaj brings extensive experience in training AI models and building full-stack applications. His passion is creating systems that help businesses grow in an exponential and efficient way through technology.",
      features: [
        {
          title: "Maximum Security",
          desc: "Applications built with high-level security protocols from the very first line of code.",
          icon: <Shield className="h-6 w-6" />
        },
        {
          title: "AI Efficiency",
          desc: "Full automation of development processes for faster and more reliable results.",
          icon: <Cpu className="h-6 w-6" />
        },
        {
          title: "Modern Team",
          desc: "Specialists who master the latest AI and web development technologies.",
          icon: <Users className="h-6 w-6" />
        }
      ]
    }
  };

  const c = content[lang];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header lang={lang} />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-32 pb-48 overflow-hidden bg-black text-white text-center">
            {/* Background Wallpaper */}
            <motion.div 
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute inset-0 z-0"
            >
               <NextImage 
                  src="/background/wallpaper-dark3.jpg"
                  alt="Vision Wallpaper"
                  fill
                  className="object-cover scale-110"
                  priority
               />
               <div className="absolute inset-0 bg-black/40" />
               <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-white to-transparent" />
            </motion.div>

          <div className="container px-4 mx-auto relative z-10 flex flex-col items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
              className="inline-flex items-center gap-2 px-5 py-2 mb-10 text-[10px] font-bold tracking-[0.2em] text-white uppercase bg-white/10 rounded-full border border-white/20 backdrop-blur-md"
            >
              <Sparkles className="h-3 w-3" />
              {c.tag}
            </motion.div>
            
            <motion.h1 
              initial={{ filter: 'blur(20px)', opacity: 0, y: 20 }}
              animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl sm:text-4xl md:text-7xl lg:text-8xl font-extrabold font-headline mb-8 md:mb-10 tracking-tighter leading-[1.1] text-white"
            >
              {c.title}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg md:text-2xl lg:text-3xl text-zinc-300 mb-10 md:mb-14 leading-relaxed max-w-3xl mx-auto font-medium tracking-tight"
            >
              {c.subtitle}
            </motion.p>

            <div className="flex items-center gap-12 pt-10 border-t border-white/10 w-full max-w-4xl justify-center">
                <div className="flex flex-col items-center">
                   <span className="text-4xl md:text-5xl font-bold font-headline text-white tracking-tighter">2025</span>
                   <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mt-2">{lang === 'sq' ? 'Themeluar' : 'Established'}</span>
                </div>
                <div className="h-12 w-[1px] bg-white/10 hidden md:block" />
                <div className="flex flex-col items-center">
                   <span className="text-4xl md:text-5xl font-bold font-headline text-white tracking-tighter">AI-First</span>
                   <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mt-2">{lang === 'sq' ? 'Metodologjia' : 'Methodology'}</span>
                </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-32 bg-zinc-50/30 overflow-hidden relative">
           <div className="container px-4 mx-auto">
              <div className="flex flex-col lg:flex-row items-center gap-24">
                 <div className="lg:w-1/2">
                    <div className="flex items-center gap-6 mb-8 text-blue-600">
                        <div className="h-1.5 w-16 bg-blue-500 rounded-full" />
                        <span className="font-bold tracking-[0.3em] uppercase text-[10px]">{c.aboutTitle}</span>
                    </div>
                    <p className="text-2xl md:text-4xl lg:text-5xl font-extrabold font-headline text-black mb-10 tracking-tighter leading-tight">
                       {c.aboutText}
                    </p>
                    <p className="text-lg md:text-2xl text-zinc-500 leading-relaxed font-medium tracking-tight">
                       {c.strategyText}
                    </p>
                 </div>
                 <div className="lg:w-1/2 relative">
                    <div className="relative aspect-square w-full rounded-[3rem] md:rounded-[4rem] overflow-hidden bg-white border border-black/5 shadow-2xl group">
                       <NextImage 
                          src="https://nnuptjtmzjdjegjguqbh.supabase.co/storage/v1/object/public/Blue%20Square/3d-rendering-holographic-liquid-shape-for-decoration-or-mixed-media-transparent-background-free-png.webp"
                          alt="Holographic visualization"
                          fill
                          className="object-contain p-16 transition-all duration-1000 group-hover:scale-110"
                       />
                       <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent pointer-events-none" />
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Features Grid */}
        <section className="py-32 bg-white">
           <div className="container px-4 mx-auto">
              <div className="grid md:grid-cols-3 gap-10">
                 {c.features.map((f, i) => (
                    <Card key={i} className="p-10 border-black/5 bg-zinc-50/50 rounded-[2.5rem] hover:bg-white hover:border-blue-200 hover:shadow-2xl transition-all duration-500 group">
                       <div className="h-16 w-16 rounded-2xl bg-white border border-black/5 flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          {f.icon}
                       </div>
                       <h3 className="text-2xl font-bold text-black mb-4 tracking-tighter">{f.title}</h3>
                       <p className="text-zinc-500 leading-relaxed font-medium">{f.desc}</p>
                    </Card>
                 ))}
              </div>
           </div>
        </section>

        {/* Team Section */}
        <section className="py-32 bg-white border-t border-black/5">
           <div className="container px-4 mx-auto">
              <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-20">
                 <div className="w-full lg:w-2/5">
                    <div className="relative aspect-[1/1] w-full rounded-[3rem] md:rounded-[4rem] overflow-hidden bg-white shadow-2xl group border-4 border-white transition-all duration-700 hover:scale-[1.02]">
                        <NextImage 
                          src="/background/danielfrrokaj.PNG"
                          alt="Daniel Frrokaj - AI & Engineering Leadership"
                          fill
                          className="object-cover transition-all duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10" />
                        <div className="absolute bottom-10 left-10 z-20 text-white">
                            <h4 className="text-3xl font-extrabold tracking-tighter">{c.teamMember}</h4>
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/80">{c.teamRole}</p>
                        </div>
                    </div>
                 </div>
                 <div className="w-full lg:w-3/5">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] text-blue-600 uppercase bg-blue-50/50 rounded-full border border-blue-100 mb-8">
                       {c.teamTitle}
                    </div>
                     <div className="mb-10">
                        <h3 className="text-3xl md:text-5xl font-extrabold font-headline text-black tracking-tighter leading-tight mb-2">
                           {c.teamMember}
                        </h3>
                        <p className="text-xl md:text-2xl font-bold text-blue-600 tracking-tight">
                           {lang === 'sq' ? 'Kryeinxhinier' : 'Lead Engineer'}
                        </p>
                     </div>
                    <p className="text-lg md:text-2xl text-zinc-500 leading-relaxed font-medium tracking-tight">
                       {c.teamDesc}
                    </p>
                    <div className="mt-12 flex flex-wrap gap-4">
                        <Badge variant="outline" className="px-6 py-3 rounded-full border-black/5 font-bold text-black bg-zinc-50 hover:bg-black hover:text-white transition-all">AI Model Training</Badge>
                        <Badge variant="outline" className="px-6 py-3 rounded-full border-black/5 font-bold text-black bg-zinc-50 hover:bg-black hover:text-white transition-all">Full Stack Apps</Badge>
                        <Badge variant="outline" className="px-6 py-3 rounded-full border-black/5 font-bold text-black bg-zinc-50 hover:bg-black hover:text-white transition-all">Business Growth</Badge>
                        <Badge variant="outline" className="px-6 py-3 rounded-full border-black/5 font-bold text-black bg-zinc-50 hover:bg-black hover:text-white transition-all">Efficient Pipelines</Badge>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Partners Section */}
        <section className="py-24 bg-zinc-50/50 border-y border-black/5">
           <div className="container px-4 mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] text-blue-600 uppercase bg-blue-50/50 rounded-full border border-blue-100 mb-12">
                 {lang === 'sq' ? 'Partnerët Tanë' : 'Our Partners'}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
                 {[
                    { name: "Vodafone Albania", logo: "https://firebasestorage.googleapis.com/v0/b/studio-3380920138-3317b.firebasestorage.app/o/logos%2FVodafone_logo_2017.png?alt=media&token=68ecc179-069a-4d75-b090-88649ab1a152" },
                    { name: "Google", logo: "https://firebasestorage.googleapis.com/v0/b/studio-3380920138-3317b.firebasestorage.app/o/logos%2FGoogle_2015_logo.svg.webp?alt=media&token=1fc7e1d0-e5fe-4322-9987-43b97820b78f" },
                    { name: "Google Workspace", logo: "https://cdn-jdbmd.nitrocdn.com/yEMHtyTSADNOgebFqynalakIQNihDGqu/assets/images/optimized/rev-80fa023/www.officernd.com/wp-content/uploads/2022/03/google-workspace-logo.webp" },
                    { name: "n8n", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/N8n-logo-new.svg/1280px-N8n-logo-new.svg.png" }
                 ].map((p, i) => (
                    <div key={i} className="aspect-[3/2] flex items-center justify-center p-8 bg-white rounded-3xl border border-black/5 shadow-sm hover:shadow-xl transition-all duration-500 group">
                       <div className="relative w-full h-full">
                          <NextImage 
                             src={p.logo}
                             alt={p.name}
                             fill
                             className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500"
                          />
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Infrastructure Section */}
        <section className="py-32 bg-white container px-4 mx-auto">
           <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-20">
              <div className="flex-1">
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] text-blue-600 uppercase bg-blue-50/50 rounded-full border border-blue-100 mb-8">
                    {lang === 'sq' ? 'Besueshmëri & Cilësi' : 'Trust & Quality'}
                 </div>
                 <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold font-headline text-black mb-10 tracking-tighter leading-tight">
                    {lang === 'sq' ? 'Ne dimë me kë të punojmë për t’ju besuar punë me cilësi' : 'We know who to work with to deliver high-quality excellence'}
                 </h2>
                 <p className="text-lg md:text-2xl text-zinc-500 leading-relaxed font-medium tracking-tight mb-12">
                    {lang === 'sq' 
                       ? 'Prandaj, ne mbështetemi në infrastrukturën më të fuqishme botërore si Google Cloud Services për të garantuar shkallëzim, performancë dhe siguri maksimale.' 
                       : 'That’s why we rely on the world’s most powerful infrastructure like Google Cloud Services to ensure scalability, peak performance, and maximum security.'}
                 </p>
                 <div className="flex items-center gap-8">
                    <div className="flex flex-col">
                       <span className="text-sm font-black uppercase tracking-[0.2em] text-blue-600 mb-2">Platform</span>
                       <span className="text-xl font-bold text-black tracking-tight">Google Cloud Services</span>
                    </div>
                    <div className="w-[1px] h-10 bg-black/10" />
                    <div className="flex flex-col">
                       <span className="text-sm font-black uppercase tracking-[0.2em] text-lime-600 mb-2">Hosting</span>
                       <span className="text-xl font-bold text-black tracking-tight">Hosted on Google</span>
                    </div>
                 </div>
              </div>
              <div className="flex-shrink-0 grid grid-cols-1 gap-6 w-full md:w-auto">
                 <div className="bg-white p-10 rounded-[3rem] border border-black/5 shadow-2xl flex items-center justify-center aspect-[21/9] md:w-96 group">
                   <div className="relative w-full h-full">
                      <NextImage 
                         src="https://firebasestorage.googleapis.com/v0/b/studio-3380920138-3317b.firebasestorage.app/o/logos%2FGoogle_Cloud_logo.svg.png?alt=media&token=342092b3-1211-439c-ad26-2a1d55fdb0f3"
                         alt="Google Cloud"
                         fill
                         className="object-contain"
                      />
                   </div>
                 </div>
                 <div className="bg-white p-10 rounded-[3rem] border border-black/5 shadow-2xl flex items-center justify-center aspect-[21/9] md:w-96 group">
                   <div className="relative w-full h-full">
                      <NextImage 
                         src="https://firebasestorage.googleapis.com/v0/b/studio-3380920138-3317b.firebasestorage.app/o/logos%2FgenAI-option_288x108-black.webp?alt=media&token=0739a12f-ac63-4d22-b89a-fd85f0960217"
                         alt="Hosted on Google"
                         fill
                         className="object-contain"
                      />
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

export default function VisionPage() {
  return (
    <Suspense fallback={null}>
      <VisionContent />
    </Suspense>
  );
}
