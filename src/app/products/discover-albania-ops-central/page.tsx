'use client';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Database, MessageSquare, DollarSign, CalendarCheck, CheckCircle2, Box, Zap, Globe } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import { FinalCtaSection } from "@/components/sections/final-cta-section";

const pageContent = {
    sq: {
      title: "Discover Albania Ops Central",
      subtitle: "Sistemi i plotë operacional i automatizuar për turizmin.",
      description: "Ops Central shërben si shtylla kurrizore për bizneset turistike, duke lidhur rezervimet, financat dhe komunikimin në një fluks pune të vetëm.",
      cta: "Rezervo një Demo",
      systemTitle: "Shtyllat e Automatizimit",
      modules: [
        {
          icon: <Database className="h-6 w-6" />,
          title: "Data Entry",
          description: "Sinkronizoni automatikisht të dhënat nga Booking, Airbnb dhe kanale të tjera pa gabime manuale."
        },
        {
          icon: <MessageSquare className="h-6 w-6" />,
          title: "WhatsApp Flow",
          description: "Mesazhe automatike konfirmimi, njoftime pagesash dhe oferta të personalizuara për klientët."
        },
        {
          icon: <DollarSign className="h-6 w-6" />,
          title: "Finance Sync",
          description: "Gjeneroni raporte financiare në kohë reale dhe thjeshtoni kontabilitetin e biznesit tuaj."
        },
        {
          icon: <CalendarCheck className="h-6 w-6" />,
          title: "Live Booking",
          description: "Sinkronizim i plotë i kalendarëve në të gjitha kanalet për të parandaluar overbooking."
        }
      ],
      benefits: [
        { title: "Efikasitet +80%", description: "Reduktoni kohën e shpenzuar në administrata." },
        { title: "Saktësi Totale", description: "Eliminoni gabimet njerëzore në faturim." },
        { title: "Lidhje 24/7", description: "Komunikoni me klientët në çdo kohë automatikisht." }
      ]
    },
    en: {
      title: "Discover Albania Ops Central",
      subtitle: "The full automated operational system for modern tourism.",
      description: "Ops Central acts as the backbone for tourism businesses, connecting reservations, finance, and communication into one seamless workflow.",
      cta: "Book a Demo",
      systemTitle: "Automation Pillars",
      modules: [
        {
          icon: <Database className="h-6 w-6" />,
          title: "Data Entry",
          description: "Automatically sync data from Booking, Airbnb, and other channels without manual errors."
        },
        {
          icon: <MessageSquare className="h-6 w-6" />,
          title: "WhatsApp Flow",
          description: "Automated confirmations, payment notifications, and personalized offers for guests."
        },
        {
          icon: <DollarSign className="h-6 w-6" />,
          title: "Finance Sync",
          description: "Generate real-time financial reports and simplify your business accounting."
        },
        {
          icon: <CalendarCheck className="h-6 w-6" />,
          title: "Live Booking",
          description: "Full calendar synchronization across all channels to prevent overbooking."
        }
      ],
      benefits: [
        { title: "80% Efficiency", description: "Significantly reduce administrative overhead." },
        { title: "Total Accuracy", description: "Eliminate human errors in billing and reporting." },
        { title: "24/7 Connection", description: "Communicate with guests automatically at any time." }
      ]
    }
  }

export default function DiscoverAlbaniaOpsCentralPage({ searchParams }: { searchParams?: { lang?: string } }) {
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
                        <Box className="h-4 w-4 mr-2 text-black" />
                        {lang === 'sq' ? 'Sistem Operacional' : 'Operational System'}
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

        {/* Product Showcase */}
        <section className="py-24 md:py-40 bg-black text-white">
            <div className="container">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <h2 className="text-4xl md:text-6xl font-extrabold font-headline mb-8 tracking-tighter leading-[1]">
                            {currentContent.systemTitle}
                        </h2>
                        <p className="text-xl text-white/60 mb-12 max-w-lg leading-relaxed">
                            {currentContent.description}
                        </p>
                        <div className="grid grid-cols-2 gap-8">
                            {currentContent.benefits.map((benefit, index) => (
                                <div key={index}>
                                    <div className="text-3xl font-black mb-2">{benefit.title}</div>
                                    <div className="text-white/40 text-sm leading-relaxed">{benefit.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative aspect-square rounded-3xl overflow-hidden border border-white/10 group">
                        <Image
                            src="/images/discoveralbania.png"
                            alt="Ops Central Interface"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-10 left-10">
                            <Zap className="h-12 w-12 text-white mb-4" />
                            <div className="text-2xl font-bold tracking-tight">Full Stack Automation</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 md:py-40 border-b border-black/5">
            <div className="container">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {currentContent.modules.map((module, index) => (
                        <div key={index} className="group p-8 rounded-3xl border border-black/5 bg-gray-50/50 hover:bg-white transition-all duration-500 hover:shadow-2xl hover:shadow-black/5">
                            <div className="mb-6 p-4 rounded-2xl bg-black/5 w-fit group-hover:bg-black group-hover:text-white transition-colors duration-500">
                                {module.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-4 tracking-tight">{module.title}</h3>
                            <p className="text-black/50 leading-relaxed text-sm">
                                {module.description}
                            </p>
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