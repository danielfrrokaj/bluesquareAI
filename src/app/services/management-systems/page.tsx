'use client';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Building, LayoutDashboard, Video, UserCheck, ShieldCheck, Activity, BarChart3 } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import { FinalCtaSection } from "@/components/sections/final-cta-section";

const pageContent = {
    sq: {
      title: "Sisteme Menaxhimi & Monitorimi",
      subtitle: "Kontroll i plotë dhe vizibilitet në kohë reale mbi operacionet tuaja.",
      description: "Ne ndërtojmë sisteme të personalizuara që centralizojnë të dhënat, automatizojnë raportimin dhe rrisin sigurinë e biznesit tuaj.",
      cta: "Planifiko një Konsultë",
      featuresTitle: "Kontroll i Plotë",
      features: [
        {
          icon: <LayoutDashboard className="h-6 w-6" />,
          title: "Dashboard Inteligjent",
          description: "Panel kontrolli i unifikuar për shitjet, rezervimet dhe performancën e stafit në kohë reale."
        },
        {
          icon: <ShieldCheck className="h-6 w-6" />,
          title: "Monitorim me AI Vision",
          description: "Përdorni AI për numërimin e vizitorëve dhe detektimin e lëvizjeve të dyshimta automatikisht."
        },
        {
          icon: <Activity className="h-6 w-6" />,
          title: "Mini-PMS Efektive",
          description: "Sistem menaxhimi pronash i lehtë për t'u përdorur për hotele, apartamente dhe B&B."
        }
      ],
      processTitle: "Zbatimi i Sistemit",
      process: [
        { title: "Vlerësimi", description: "Analizojmë kërkesat tuaja specifike për monitorim.", icon: "01" },
        { title: "Dizajnimi", description: "Projektojmë arkitekturën që integron të gjitha të dhënat.", icon: "02" },
        { title: "Zhvillimi", description: "Ndërtojmë dhe instalojmë sistemin me pajisjet ekzistuese.", icon: "03" },
        { title: "Suporti", description: "Mirëmbajtje proaktive për funksionim pa ndërprerje.", icon: "04" },
      ]
    },
    en: {
      title: "Management & Monitoring Systems",
      subtitle: "Complete control and real-time visibility over your operations.",
      description: "We build custom systems that centralize data, automate reporting, and enhance the security of your business.",
      cta: "Schedule a Consultation",
      featuresTitle: "Total Control",
      features: [
        {
          icon: <LayoutDashboard className="h-6 w-6" />,
          title: "Intelligent Dashboard",
          description: "A unified control panel for sales, reservations, and staff performance in real-time."
        },
        {
          icon: <ShieldCheck className="h-6 w-6" />,
          title: "AI Vision Monitoring",
          description: "Use AI for visitor counting and suspicious motion detection automatically."
        },
        {
          icon: <Activity className="h-6 w-6" />,
          title: "Effective Mini-PMS",
          description: "Easy-to-use property management system for hotels, apartments, and B&Bs."
        }
      ],
      processTitle: "System Implementation",
      process: [
        { title: "Assessment", description: "We analyze your specific monitoring requirements.", icon: "01" },
        { title: "Design", description: "We design the architecture that integrates all data points.", icon: "02" },
        { title: "Development", description: "We build and install the system with existing hardware.", icon: "03" },
        { title: "Support", description: "Proactive maintenance for uninterrupted operation.", icon: "04" },
      ]
    }
  }

export default function ManagementSystemsPage({ searchParams }: { searchParams?: { lang?: string } }) {
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
                <div className="max-w-4xl tracking-tight">
                    <div className="inline-flex items-center rounded-full border border-black/5 bg-black/5 px-3 py-1 text-sm font-medium mb-8">
                        <BarChart3 className="h-4 w-4 mr-2 text-black" />
                        {lang === 'sq' ? 'Operacione Inteligjente' : 'Intelligent Operations'}
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