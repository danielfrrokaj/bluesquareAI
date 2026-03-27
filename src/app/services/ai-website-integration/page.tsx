'use client';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Bot, PenSquare, Search, CheckCircle, BarChart2, Globe, Cpu, Zap } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import { FinalCtaSection } from "@/components/sections/final-cta-section";
import { cn } from "@/lib/utils";

const pageContent = {
    sq: {
      title: "Integrim i AI në Website",
      subtitle: "Transformoni faqen tuaj në një mjet inteligjent marketingu dhe shërbimi ndaj klientit.",
      description: "Ne integrojmë teknologjinë më të fundit të AI për të automatizuar proceset, për të kuptuar më mirë klientët tuaj dhe për të rritur ndjeshëm prezencën tuaj online. Mos lini faqen tuaj të jetë thjesht një broshurë statike.",
      cta: "Diskuto Projektin Tënd",
      featuresTitle: "Zgjidhje Inteligjente",
      features: [
        {
          icon: <Bot className="h-6 w-6" />,
          title: "Chatbot Inteligjent 24/7",
          description: "Një asistent virtual që i përgjigjet pyetjeve, mbledh kontakte dhe ofron mbështetje për klientët në çdo kohë, pa ndërhyrje njerëzore."
        },
        {
          icon: <BarChart2 className="h-6 w-6" />,
          title: "Analizë Automatike e Trafikut",
          description: "Kuptoni sjelljen e vizitorëve dhe zbuloni se çfarë kërkojnë ata në faqen tuaj përmes raporteve të detajuara dhe vizualizimeve të qarta."
        },
        {
          icon: <PenSquare className="h-6 w-6" />,
          title: "Gjenerim Automatik i Përmbajtjes",
          description: "Kurseni kohë duke krijuar automatikisht përshkrime produktesh, artikuj blogu dhe përmbajtje SEO të optimizuar për motorët e kërkimit."
        }
      ],
      processTitle: "Metodologjia Jonë",
      process: [
        { title: "Konsultimi Fillestar", description: "Diskutojmë nevojat dhe objektivat tuaja për të përcaktuar strategjinë e duhur.", icon: "01" },
        { title: "Zhvillimi & Integrimi", description: "Ekipi ynë integron zgjidhjet e AI në infrastrukturën tuaj ekzistuese.", icon: "02" },
        { title: "Testimi & Optimizimi", description: "Sigurohemi që çdo gjë funksionon pa probleme për rezultate maksimale.", icon: "03" },
        { title: "Lansimi & Mbështetja", description: "Lansojmë zgjidhjen dhe ofrojmë mbështetje të vazhdueshme teknike.", icon: "04" },
      ]
    },
    en: {
      title: "AI Website Integration",
      subtitle: "Transform your website into an intelligent marketing and customer service tool.",
      description: "We integrate the latest AI technology to automate processes, better understand your customers, and significantly increase your online presence. Don't let your site be just a static brochure.",
      cta: "Discuss Your Project",
      featuresTitle: "Intelligent Solutions",
      features: [
        {
          icon: <Bot className="h-6 w-6" />,
          title: "24/7 Intelligent Chatbot",
          description: "A virtual assistant that answers questions, collects leads, and provides customer support at any time, without human intervention."
        },
        {
          icon: <BarChart2 className="h-6 w-6" />,
          title: "Automatic Traffic Analysis",
          description: "Understand visitor behavior and discover what they are looking for on your site through detailed reports and clear visualizations."
        },
        {
          icon: <PenSquare className="h-6 w-6" />,
          title: "Automatic Content Generation",
          description: "Save time by automatically creating product descriptions, blog articles, and SEO content optimized for search engines."
        }
      ],
      processTitle: "Our Methodology",
      process: [
        { title: "Initial Consultation", description: "We discuss your needs and objectives to determine the right integration strategy.", icon: "01" },
        { title: "Development & Integration", description: "Our team integrates AI solutions into your existing infrastructure.", icon: "02" },
        { title: "Testing & Optimization", description: "We ensure everything works smoothly and optimize for maximum results.", icon: "03" },
        { title: "Launch & Support", description: "We launch the solution and provide ongoing technical support.", icon: "04" },
      ]
    }
  }

export default function AiWebsiteIntegrationPage({ searchParams }: { searchParams?: { lang?: string } }) {
  const lang = useMemo(() => searchParams?.lang === 'sq' ? 'sq' : 'en', [searchParams?.lang]);
  const currentContent = pageContent[lang];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header lang={lang} />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-50 to-transparent -z-10" />
            <div className="container relative z-10">
                <div className="max-w-4xl">
                    <div className="inline-flex items-center rounded-full border border-black/5 bg-black/5 px-3 py-1 text-sm font-medium mb-8">
                        <Zap className="h-4 w-4 mr-2 text-black" />
                        {lang === 'sq' ? 'Inteligjencë e Integruar' : 'Integrated Intelligence'}
                    </div>
                    <h1 className="text-5xl md:text-8xl font-extrabold font-headline mb-8 tracking-tighter text-black leading-[0.9]">
                        {currentContent.title}
                    </h1>
                    <p className="text-xl md:text-3xl text-black/60 leading-tight font-medium mb-10 max-w-2xl">
                        {currentContent.subtitle}
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Button size="lg" className="h-16 px-8 rounded-2xl bg-black text-white hover:bg-black/90 font-bold text-lg group" asChild>
                            <Link href={`/contact?lang=${lang}`}>
                                {currentContent.cta}
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>

        {/* Feature Highlights */}
        <section className="py-24 md:py-40 bg-black text-white">
            <div className="container">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <h2 className="text-4xl md:text-6xl font-extrabold font-headline mb-8 tracking-tighter leading-[1]">
                            {currentContent.featuresTitle}
                        </h2>
                        <p className="text-xl text-white/60 mb-12 max-w-lg leading-relaxed">
                            {currentContent.description}
                        </p>
                    </div>
                    <div className="space-y-6">
                        {currentContent.features.map((feature, index) => (
                            <div key={index} className="group p-8 rounded-3xl border border-white/10 bg-white/5 hover:bg-white hover:text-black transition-all duration-500">
                                <div className="flex items-start gap-6">
                                    <div className="p-3 rounded-2xl bg-white/10 group-hover:bg-black/5 transition-colors">
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2 tracking-tight">{feature.title}</h3>
                                        <p className="text-white/40 group-hover:text-black/60 transition-colors leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        {/* Process Section */}
        <section className="py-24 md:py-40 border-b border-black/5">
            <div className="container">
                <div className="text-center mb-24">
                    <h2 className="text-4xl md:text-6xl font-extrabold font-headline tracking-tighter mb-6">{currentContent.processTitle}</h2>
                </div>
                <div className="grid md:grid-cols-4 gap-12">
                   {currentContent.process.map((step, index) => (
                       <div key={index} className="group relative">
                           <div className="text-8xl font-black font-headline text-black/5 mb-6 transition-colors group-hover:text-black/10 select-none">
                               {step.icon}
                           </div>
                           <h3 className="text-xl font-bold mb-4 tracking-tight">{step.title}</h3>
                           <p className="text-black/50 leading-relaxed">{step.description}</p>
                       </div>
                   ))}
                </div>
            </div>
        </section>

        <FinalCtaSection lang={lang} />
      </main>
      <Footer lang={lang} />
    </div>
  );
}