'use client';

import { Suspense } from 'react';
import NextImage from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  MessageCircle, 
  Mic, 
  Zap, 
  Smartphone, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  BarChart,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { FinalCtaSection } from '@/components/sections/final-cta-section';

function AiInnovationContent() {
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') === 'sq' ? 'sq' : 'en';

  const content = {
    sq: {
      tag: "AI për Inovacion",
      title: "ShqipFol: Zëri i Gjuhës Shqipe në Xhepin Tuaj",
      subtitle: "Përktheni zërin tuaj në kohë reale me ShqipFol – mjeti suprem për komunikim të shpejtë dhe natyral.",
      description: "ShqipFol është krijuar për të thyer menjëherë barrierat gjuhësore. Pavarësisht nëse jeni duke udhëtuar, në një takim pune ose thjesht duke biseduar me miqtë, ShqipFol kupton zërin tuaj dhe përgjigjet me një zë natyral njerëzor.",
      featuresHeader: "Pse të zgjidhni ShqipFol?",
      features: [
        {
          title: "Përkthim Drejtpërdrejt",
          desc: "Flisni natyrshëm dhe dëgjoni përkthimin menjëherë. Teknologjia jonë eliminon pauzat e pakëndshme.",
          icon: <Mic className="h-6 w-6 text-black" />
        },
        {
          title: "Zëra Premium Natyralë",
          desc: "Zgjidhni nga një shumëllojshmëri zërash njerëzorë (Bardha, Dielli, Genti) të krijuar për të tingëlluar autentikë.",
          icon: <Zap className="h-6 w-6 text-black" />
        },
        {
          title: "Gati për CarPlay",
          desc: "Mbështetje e plotë për CarPlay dhe integrim me butonat e timonit për përkthim të sigurt gjatë vozitjes.",
          icon: <CheckCircle2 className="h-6 w-6 text-black" />
        },
        {
          title: "Identifikim Automatik",
          desc: "Aplikacioni identifikon në mënyrë inteligjente nëse jeni duke folur shqip apo një gjuhë të huaj.",
          icon: <Smartphone className="h-6 w-6 text-black" />
        }
      ],
      whyHeader: "Thjeshtë. Shpejt. Profesional.",
      whyText: "ShqipFol nuk është thjesht një përkthyes, është asistenti juaj personal i interpretimit që ju ndihmon të flisni gjuhën e botës. Mbani kontroll të plotë me 'Hold-to-Talk' për privatësi të shtuar dhe performancë më të mirë në ambiente të zhurmshme.",
      cta: "Shkarkoni Tani",
      sections: [
        {
          title: "Chatbote & Automatizime",
          desc: "Përveç ShqipFol, ne ndërtojmë chatbot-e inteligjentë dhe sisteme automatizimi me n8n dhe Openclaw për të revolucionarizuar punën tuaj.",
          icon: <MessageCircle className="h-10 w-10" />
        }
      ]
    },
    en: {
      tag: "AI for Innovation",
      title: "ShqipFol: The Voice of Albanian in Your Pocket",
      subtitle: "Translate your voice in real-time with ShqipFol – the ultimate tool for fast, natural communication.",
      description: "ShqipFol is designed to break language barriers instantly. Whether you are traveling, in a business meeting, or simply chatting with friends, ShqipFol understands your voice and responds with a natural, human-like voice.",
      featuresHeader: "Why choose ShqipFol?",
      features: [
        {
          title: "Live Translation",
          desc: "Speak naturally and hear the translation immediately. Our technology eliminates awkward pauses.",
          icon: <Mic className="h-6 w-6 text-black" />
        },
        {
          title: "Premium Natural Voices",
          desc: "Choose from human-like voices (Bardha, Dielli, Genti) designed to sound authentic.",
          icon: <Zap className="h-6 w-6 text-black" />
        },
        {
          title: "CarPlay Ready",
          desc: "Full CarPlay support and steering wheel integration for safe translation while driving.",
          icon: <CheckCircle2 className="h-6 w-6 text-black" />
        },
        {
          title: "Auto Language Detection",
          desc: "Intelligently identifies whether you are speaking Albanian or a foreign language instantly.",
          icon: <Smartphone className="h-6 w-6 text-black" />
        }
      ],
      whyHeader: "Simple. Fast. Professional.",
      whyText: "ShqipFol isn't just a translator, it's your personal live interpreter that helps you speak the language of the world. Maintain total control with 'Hold-to-Talk' for enhanced privacy and better performance in loud environments.",
      cta: "Download Now",
      sections: [
        {
          title: "Chatbots & Automation",
          desc: "Beyond ShqipFol, we build intelligent chatbots and automation systems with n8n and Openclaw to revolutionize your workflow.",
          icon: <MessageCircle className="h-10 w-10" />
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
        <section className="relative pt-32 pb-48 overflow-hidden text-white text-center">
          {/* Background Wallpaper */}
          <div className="absolute inset-0 z-0">
            <NextImage 
              src="/background/header_wallpaper_services:ai-innovation.jpg"
              alt="AI Innovation Wallpaper"
              fill
              className="object-cover"
              priority
            />
            {/* Dark overlay for better text contrast */}
            <div className="absolute inset-0 bg-black/40" />
            
            {/* Bottom fading transition */}
            <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-white to-transparent" />
          </div>

          <div className="container px-4 mx-auto relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 mb-10 text-[10px] font-bold tracking-[0.2em] text-white uppercase bg-white/10 rounded-full border border-white/20 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              {c.tag}
            </div>
            
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-extrabold font-headline text-white mb-8 md:mb-10 tracking-tighter leading-[1.1] md:leading-[1.05]">
              {c.title}
            </h1>
            
            <p className="text-lg md:text-2xl lg:text-3xl text-white/90 mb-10 md:mb-14 leading-relaxed max-w-3xl mx-auto font-medium tracking-tight">
              {c.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-8">
              <Button size="lg" className="h-16 md:h-20 px-10 md:px-16 w-full sm:w-auto rounded-full font-bold text-xl md:text-2xl bg-white text-black hover:bg-zinc-100 shadow-2xl transition-all hover:scale-105 active:scale-95">
                {c.cta} <ArrowRight className="ml-2 h-5 w-5 md:h-6 md:w-6" />
              </Button>
              <Button size="lg" variant="outline" className="h-16 md:h-20 px-10 md:px-16 w-full sm:w-auto rounded-full font-bold text-xl md:text-2xl border-white/20 text-white bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all active:scale-95">
                {lang === 'sq' ? 'Mëso më Shumë' : 'Learn More'}
              </Button>
            </div>
          </div>
        </section>

        {/* Main Description */}
        <section className="py-24 bg-white border-y border-black/5 relative overflow-hidden">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-blue-500/5 -z-0" />
          <div className="container px-4 mx-auto relative z-10">
            <div className="flex flex-col items-center mb-20 text-center">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] text-blue-600 uppercase bg-blue-50/50 rounded-full border border-blue-100 mb-6">
                 {lang === 'sq' ? 'Kapacitetet Ekspert' : 'Expert Capabilities'}
               </div>
               <h3 className="text-3xl md:text-5xl font-extrabold font-headline text-black tracking-tighter">
                 {c.featuresHeader}
               </h3>
               <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-lime-500 rounded-full mt-10" />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                "https://firebasestorage.googleapis.com/v0/b/studio-3380920138-3317b.firebasestorage.app/o/bluesquare%20AI%20website%2Fpervojeepnaderprere%20(2).png?alt=media&token=7fbc91cb-47f4-4782-b816-c182121c7d82",
                "https://firebasestorage.googleapis.com/v0/b/studio-3380920138-3317b.firebasestorage.app/o/bluesquare%20AI%20website%2Fgjenerimnatyral.png?alt=media&token=be1fe16b-1f9a-4400-b6c1-a75fac95bfe1",
                "https://firebasestorage.googleapis.com/v0/b/studio-3380920138-3317b.firebasestorage.app/o/bluesquare%20AI%20website%2Fpervojeepnaderprere.png?alt=media&token=85648bf8-db83-47a7-82cd-daae47c0a638",
                "https://firebasestorage.googleapis.com/v0/b/studio-3380920138-3317b.firebasestorage.app/o/bluesquare%20AI%20website%2Foptimizuarperios.png?alt=media&token=5063154d-0632-4fed-a96a-0ed3994084bd"
              ].map((img, i) => (
                <Card key={i} className="overflow-hidden border-black/[0.03] bg-zinc-50/50 hover:bg-white hover:border-blue-200 transition-all duration-500 group rounded-[2.5rem] md:rounded-[3rem] shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(59,130,246,0.1)] hover:-translate-y-2">
                  <div className="relative aspect-square w-full">
                    <NextImage 
                      src={img}
                      alt={`Feature ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Projects Showcase Section */}
        <section className="py-32 bg-zinc-50/30">
          <div className="container px-4 mx-auto">
            <div className="flex flex-col items-center mb-20 text-center">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] text-blue-600 uppercase bg-blue-50/50 rounded-full border border-blue-100 mb-6">
                 {lang === 'sq' ? 'Projektet Tona' : 'Our Projects'}
               </div>
               <h2 className="text-3xl md:text-5xl font-extrabold font-headline text-black tracking-tighter">
                 {lang === 'sq' ? 'Zgjidhjet që kemi Ndërtuar' : 'Portfolio of Innovation'}
               </h2>
               <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-lime-500 rounded-full mt-10" />
            </div>
            
            <div className="flex flex-col gap-16 max-w-7xl mx-auto">
                <Card className="overflow-hidden border-black/5 shadow-2xl rounded-[2rem] md:rounded-[3rem] group bg-white">
                    <div className="relative w-full">
                        <NextImage 
                            src="https://firebasestorage.googleapis.com/v0/b/studio-3380920138-3317b.firebasestorage.app/o/bluesquare%20AI%20website%2FUntitled%20design%20(1).png?alt=media&token=79776295-c0cf-4ff5-b12e-015d85915a3c"
                            alt="AI Projects Showcase"
                            width={1920}
                            height={1080}
                            className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                        />
                    </div>
                </Card>
                <Card className="overflow-hidden border-black/5 shadow-2xl rounded-[2rem] md:rounded-[3rem] group bg-white">
                    <div className="relative w-full">
                        <NextImage 
                            src="https://firebasestorage.googleapis.com/v0/b/studio-3380920138-3317b.firebasestorage.app/o/bluesquare%20AI%20website%2FMenaxhim%20i%20lehte%CC%88%20i%20hotelit%20tuaj.png?alt=media&token=920dc86d-30bf-4bab-b595-a94735755f86"
                            alt="Hotel Management Solution"
                            width={1920}
                            height={1080}
                            className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                        />
                    </div>
                </Card>
            </div>
          </div>
        </section>

        {/* Innovation Expansion Section */}
        <section className="py-32 bg-white text-black overflow-hidden relative">
          <div className="container px-4 mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-24">
              <div className="lg:w-1/2">
                  <div className="flex items-center gap-6 mb-8 text-blue-600">
                    <div className="h-1.5 w-16 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                    <span className="font-bold tracking-[0.3em] uppercase text-[10px]">{lang === 'sq' ? 'Përtej Aplikacionit' : 'Beyond the App'}</span>
                  </div>
                  <h2 className="text-3xl md:text-6xl font-extrabold font-headline mb-8 md:mb-10 tracking-tighter leading-tight text-black">
                    {c.sections[0].title}
                  </h2>
                  <p className="text-xl md:text-2xl text-zinc-500 leading-relaxed mb-12 max-w-xl font-medium tracking-tight">
                    {c.sections[0].desc}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
                    <div className="p-8 bg-zinc-50/50 border border-black/[0.03] rounded-[2.5rem] backdrop-blur-sm group hover:bg-white hover:border-lime-300 hover:shadow-[0_30px_60px_-15px_rgba(163,230,81,0.15)] transition-all duration-500">
                      <div className="h-12 w-12 rounded-2xl bg-white border border-black/5 flex items-center justify-center mb-6 group-hover:bg-lime-50 group-hover:text-lime-600 transition-all shadow-sm">
                        <Sparkles className="h-6 w-6 text-black" />
                      </div>
                      <span className="font-bold block text-xl mb-2 text-black">n8n Automation</span>
                      <p className="text-sm text-zinc-500 font-medium">Workflow automation</p>
                    </div>
                    <div className="p-8 bg-zinc-50/50 border border-black/[0.03] rounded-[2.5rem] backdrop-blur-sm group hover:bg-white hover:border-blue-300 hover:shadow-[0_30px_60px_-15px_rgba(59,130,246,0.15)] transition-all duration-500">
                      <div className="h-12 w-12 rounded-2xl bg-white border border-black/5 flex items-center justify-center mb-6 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all shadow-sm">
                        <BarChart className="h-6 w-6 text-black" />
                      </div>
                      <span className="font-bold block text-xl mb-2 text-black">Openclaw AI</span>
                      <p className="text-sm text-zinc-500 font-medium">Intelligent Insights</p>
                    </div>
                  </div>
              </div>
              <div className="lg:w-1/2 relative group">
                 <div className="relative p-12 bg-zinc-50/50 border border-black/[0.03] rounded-[4rem] backdrop-blur-xl transition-all duration-700 group-hover:bg-white group-hover:border-blue-100 group-hover:shadow-[0_60px_100px_-20px_rgba(59,130,246,0.1)]">
                    <div className="p-8 bg-white rounded-[2rem] shadow-sm w-fit mb-10 border border-black/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-700">
                       <MessageCircle className="h-12 w-12 text-blue-600" />
                    </div>
                    <div className="space-y-6">
                       <div className="h-3 w-3/4 bg-blue-500/10 rounded-full group-hover:bg-blue-500/20 transition-all" />
                       <div className="h-3 w-1/2 bg-lime-400/10 rounded-full group-hover:bg-lime-400/20 transition-all" />
                       <div className="h-3 w-5/6 bg-black/5 rounded-full" />
                    </div>
                 </div>
                 <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] group-hover:bg-blue-500/10 transition-all" />
                 <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-lime-400/5 rounded-full blur-[100px] group-hover:bg-lime-400/10 transition-all" />
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

export default function AiInnovationPage() {
  return (
    <Suspense fallback={null}>
      <AiInnovationContent />
    </Suspense>
  );
}

