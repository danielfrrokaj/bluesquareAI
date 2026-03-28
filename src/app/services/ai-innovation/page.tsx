'use client';

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

export default function AiInnovationPage() {
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') === 'sq' ? 'sq' : 'en';

  const content = {
    sq: {
      tag: "AI për Inovacion",
      title: "ShqipFol: Zëri i Gjuhës Shqipe në Xhepin Tuaj",
      subtitle: "Zbuloni mënyrën më të lehtë dhe inovative për të ndërvepruar me gjuhën shqipe!",
      description: "ShqipFol është dizenjuar për t'ju ofruar një eksperiencë të shkëlqyer në komunikim, përkthim dhe kthim të tekstit në zë, e gjitha përmes një ndërfaqeje intuitive dhe moderne.",
      featuresHeader: "Karakteristikat Kryesore",
      features: [
        {
          title: "Njohje e Saktë e Zërit",
          desc: "Njohje profesionale e zërit në shqip dhe konvertim i shpejtë i fjalës në tekst me saktësi maksimale.",
          icon: <Mic className="h-6 w-6 text-black" />
        },
        {
          title: "Gjenerim Natyral i Zërit",
          desc: "Gjenerim natyral i zërit nga teksti me theks të saktë shqiptar dhe intonacion njerëzor.",
          icon: <Zap className="h-6 w-6 text-black" />
        },
        {
          title: "Përvojë e Pandërprerë",
          desc: "Ndërfaqe e thjeshtë, pa reklama bezdisëse dhe e lehtë për t'u përdorur nga kushdo.",
          icon: <CheckCircle2 className="h-6 w-6 text-black" />
        },
        {
          title: "Optimizuar për iOS",
          desc: "Performancë e lartë, e përshtatur posaçërisht për ekosistemin Apple për një eksperiencë të shpejtë.",
          icon: <Smartphone className="h-6 w-6 text-black" />
        }
      ],
      whyHeader: "Pse të zgjidhni ShqipFol?",
      whyText: "Nëse jeni duke kërkuar një mjet të fuqishëm për t'ju ndihmuar në përditshmërinë tuaj me gjuhën shqipe—qoftë për produktivitet, qasje më të lehtë në informacione apo komunikim—ShqipFol është zgjidhja ideale. Shkarkojeni tani dhe provoni një standard të ri në aplikacionet shqiptare!",
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
      subtitle: "Discover the easiest and most innovative way to interact with the Albanian language!",
      description: "ShqipFol is designed to offer a superior experience in communication, translation, and text-to-speech, all through an intuitive and modern interface.",
      featuresHeader: "Key Features",
      features: [
        {
          title: "Accurate Voice Recognition",
          desc: "Professional Albanian voice recognition and fast speech-to-text conversion with maximum precision.",
          icon: <Mic className="h-6 w-6 text-black" />
        },
        {
          title: "Natural Voice Generation",
          desc: "Natural text-to-speech generation with accurate Albanian accent and human-like intonation.",
          icon: <Zap className="h-6 w-6 text-black" />
        },
        {
          title: "Seamless Experience",
          desc: "Simple interface, no annoying ads, and easy to use for everyone.",
          icon: <CheckCircle2 className="h-6 w-6 text-black" />
        },
        {
          title: "iOS Optimized",
          desc: "High performance, specifically tuned for the Apple ecosystem for a smooth and fast experience.",
          icon: <Smartphone className="h-6 w-6 text-black" />
        }
      ],
      whyHeader: "Why choose ShqipFol?",
      whyText: "If you are looking for a powerful tool to help you in your daily life with the Albanian language—be it for productivity, easier information access, or communication—ShqipFol is the ideal solution. Download it now and experience a new standard in Albanian applications!",
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
                {c.cta} <ArrowRight className="ml-2 h-5 w-5 md:h-6 md:w-6" />
              </Button>
              <Button size="lg" variant="outline" className="h-16 md:h-20 px-10 md:px-16 w-full sm:w-auto rounded-full font-bold text-xl md:text-2xl border-black/5 text-black hover:bg-zinc-50 transition-all active:scale-95">
                {lang === 'sq' ? 'Mëso më Shumë' : 'Learn More'}
              </Button>
            </div>
          </div>
          
          {/* Background Accents */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[140px] opacity-40 animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[800px] h-[800px] bg-lime-400/5 rounded-full blur-[140px] opacity-30 animate-pulse" />
          </div>
        </section>

        {/* Main Description */}
        <section className="py-24 bg-white border-y border-black/5 relative overflow-hidden">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-blue-500/5 -z-0" />
          <div className="container px-4 mx-auto relative z-10">
            <div className="max-w-4xl mx-auto text-center mb-24">
              <p className="text-2xl md:text-3xl lg:text-4xl text-black leading-tight font-extrabold tracking-tight">
                "{c.description}"
              </p>
            </div>

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
              {c.features.map((f, i) => (
                <Card key={i} className="p-8 md:p-10 border-black/[0.03] bg-zinc-50/50 hover:bg-white hover:border-blue-200 transition-all duration-500 group rounded-[2.5rem] md:rounded-[3rem] shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(59,130,246,0.1)] hover:-translate-y-2">
                  <div className="mb-8 p-5 rounded-[1.25rem] bg-white shadow-sm border border-black/5 text-black group-hover:text-blue-600 group-hover:bg-blue-50 transition-all duration-500 flex items-center justify-center">
                    {f.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-black font-headline tracking-tight">{f.title}</h3>
                  <p className="text-zinc-500 leading-relaxed font-medium tracking-tight">{f.desc}</p>
                </Card>
              ))}
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

        {/* Why Section */}
        <section className="py-32 bg-white">
          <div className="container px-4 mx-auto">
            <div className="max-w-5xl mx-auto bg-black rounded-[2.5rem] md:rounded-[4rem] p-10 md:p-32 text-center relative overflow-hidden shadow-[0_60px_100px_-20px_rgba(0,0,0,0.3)]">
              <div className="relative z-10 flex flex-col items-center">
                <div className="h-20 w-20 md:h-24 md:w-24 rounded-[1.5rem] md:rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mb-10 md:mb-12 backdrop-blur-sm group hover:scale-110 transition-transform">
                  <ShieldCheck className="h-10 w-10 md:h-12 md:w-12 text-blue-400" />
                </div>
                <h2 className="text-3xl md:text-6xl lg:text-7xl font-extrabold font-headline text-white mb-8 md:mb-10 tracking-tighter leading-tight">
                  {c.whyHeader}
                </h2>
                <div className="w-20 md:w-24 h-1 md:h-1.5 bg-gradient-to-r from-blue-500 to-lime-500 rounded-full mb-10 md:mb-12 shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
                <p className="text-xl md:text-3xl text-zinc-400 leading-relaxed mb-12 md:mb-16 font-medium tracking-tight max-w-3xl mx-auto">
                  {c.whyText}
                </p>
                <Button size="lg" asChild className="h-16 md:h-20 px-10 md:px-16 w-full sm:w-auto rounded-full font-bold text-xl md:text-2xl bg-white text-black hover:bg-zinc-100 transition-all hover:scale-105 active:scale-95 shadow-xl">
                  <Link href={`/contact?lang=${lang}`}>{lang === 'sq' ? 'Kontaktoni Ekipin' : 'Contact Our Team'}</Link>
                </Button>
              </div>
              <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1)_0%,transparent_50%)]" />
              <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(163,230,81,0.05)_0%,transparent_50%)]" />
            </div>
          </div>
        </section>

        <FinalCtaSection lang={lang} />
      </main>
      <Footer lang={lang} />
    </div>
  );
}
