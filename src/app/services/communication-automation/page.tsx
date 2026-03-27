'use client';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, MessageCircle, Instagram, Facebook, Smartphone, Zap, MessageSquare, Share2 } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import { FinalCtaSection } from "@/components/sections/final-cta-section";
import { cn } from "@/lib/utils";

const pageContent = {
    sq: {
      title: "Automatizim Komunikimi",
      subtitle: "Lidhuni me klientët tuaj në çdo platformë, në mënyrë automatike dhe efikase.",
      description: "Ne ofrojmë zgjidhje të avancuara për automatizimin e komunikimit, duke ju lejuar të jeni prezent për klientët 24/7, të menaxhoni bisedat dhe të rrisni angazhimin pa ngarkuar stafin tuaj.",
      cta: "Fillo Automatizimin",
      featuresTitle: "Komunikoni pa Kufij",
      features: [
        {
          icon: <Smartphone className="h-6 w-6" />,
          title: "WhatsApp Business API",
          description: "Dërgoni mesazhe automatike për rezervime, njoftime, kujtesa dhe oferta speciale direkt në WhatsApp-in e klientëve tuaj."
        },
        {
          icon: <MessageSquare className="h-6 w-6" />,
          title: "Përgjigje të Menjëhershme",
          description: "Një AI që kupton pyetjet e zakonshme (oraret, çmimet, disponueshmëria) dhe përgjigjet automatikisht në çdo kohë."
        },
        {
          icon: <Share2 className="h-6 w-6" />,
          title: "Centralizim i Kanalave",
          description: "Lidhuni me Instagram DM, Facebook Messenger dhe Google Business Chat për të menaxhuar të gjitha bisedat nga një vend."
        }
      ],
      processTitle: "Rruga drejt Automatizimit",
      process: [
        { title: "Analiza e Kanalave", description: "Identifikojmë kanalet më të rëndësishme për biznesin tuaj.", icon: "01" },
        { title: "Konfigurimi i Sistemit", description: "Konfigurojmë API-të dhe ndërtojmë logjikën e AI-së për përgjigjet.", icon: "02" },
        { title: "Trajnimi i AI", description: "Trajnojmë modelin me informacionin specifik të biznesit tuaj.", icon: "03" },
        { title: "Aktivizimi", description: "Aktivizojmë sistemin dhe monitorojmë performancën në kohë reale.", icon: "04" },
      ]
    },
    en: {
      title: "Communication Automation",
      subtitle: "Connect with your customers on any platform, automatically and efficiently.",
      description: "We provide advanced communication automation solutions, allowing you to be available for customers 24/7, manage conversations, and increase engagement without overloading your staff.",
      cta: "Start Automating",
      featuresTitle: "Communicate Without Limits",
      features: [
        {
          icon: <Smartphone className="h-6 w-6" />,
          title: "WhatsApp Business API",
          description: "Send automated messages for reservations, notifications, reminders, and special offers directly to your customers' WhatsApp."
        },
        {
          icon: <MessageSquare className="h-6 w-6" />,
          title: "Instant AI Responses",
          description: "An AI that understands common questions (schedules, prices, availability) and responds automatically at any time."
        },
        {
          icon: <Share2 className="h-6 w-6" />,
          title: "Channel Centralization",
          description: "Connect with Instagram DM, Facebook Messenger, and Google Business Chat to manage all conversations from a single place."
        }
      ],
      processTitle: "Path to Automation",
      process: [
        { title: "Channel Analysis", description: "We identify the most important communication channels for your business.", icon: "01" },
        { title: "System Configuration", description: "We configure the APIs and build the AI logic for automated responses.", icon: "02" },
        { title: "AI Training", description: "We train the AI model with your specific business information.", icon: "03" },
        { title: "Activation", description: "We activate the system and monitor its performance in real-time.", icon: "04" },
      ]
    }
  }

export default function CommunicationAutomationPage({ searchParams }: { searchParams?: { lang?: string } }) {
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
                        <MessageCircle className="h-4 w-4 mr-2 text-black" />
                        {lang === 'sq' ? 'Komunikim Inteligjent' : 'Intelligent Communication'}
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