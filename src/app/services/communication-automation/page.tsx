'use client';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, MessageCircle, Instagram, Facebook, Smartphone } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

const pageContent = {
    sq: {
      title: "Automatizim Komunikimi",
      subtitle: "Lidhuni me klientët tuaj në çdo platformë, në mënyrë automatike dhe efikase.",
      description: "Ne ofrojmë zgjidhje të avancuara për automatizimin e komunikimit, duke ju lejuar të jeni prezent për klientët 24/7, të menaxhoni bisedat dhe të rrisni angazhimin.",
      cta: "Fillo Automatizimin",
      featuresTitle: "Funksionalitetet Kryesore",
      features: [
        {
          icon: <Smartphone className="h-8 w-8 text-primary" />,
          title: "Integrim me WhatsApp Business API",
          description: "Dërgoni mesazhe automatike për rezervime, njoftime, kujtesa dhe oferta speciale direkt në WhatsApp-in e klientëve tuaj."
        },
        {
          icon: <MessageCircle className="h-8 w-8 text-primary" />,
          title: "AI Chatbot për Përgjigje të Menjëhershme",
          description: "Një AI që kupton pyetjet e zakonshme (oraret, çmimet, disponueshmëria) dhe përgjigjet automatikisht, duke liruar stafin tuaj."
        },
        {
          icon: <div className="flex gap-2"><Instagram className="h-8 w-8 text-primary" /><Facebook className="h-8 w-8 text-primary" /></div>,
          title: "Centralizim i Rrjeteve Sociale",
          description: "Lidhuni me Instagram DM, Facebook Messenger dhe Google Business Chat për të menaxhuar të gjitha bisedat nga një vend i vetëm."
        }
      ],
      processTitle: "Procesi i Implementimit",
      process: [
        { title: "Analiza e Kanalave", description: "Identifikojmë kanalet më të rëndësishme të komunikimit për biznesin tuaj.", icon: "1" },
        { title: "Konfigurimi i Sistemit", description: "Konfigurojmë API-të dhe ndërtojmë logjikën e AI-së për përgjigjet automatike.", icon: "2" },
        { title: "Trajnimi i AI", description: "Trajnojmë modelin e AI me informacionin specifik të biznesit tuaj për përgjigje të sakta.", icon: "3" },
        { title: "Aktivizimi & Monitorimi", description: "Aktivizojmë sistemin dhe monitorojmë performancën për të siguruar komunikim efikas.", icon: "4" },
      ],
      finalCtaTitle: "Gati për të automatizuar komunikimin tuaj?",
      finalCtaDescription: "Lëreni teknologjinë të punojë për ju. Na kontaktoni për një zgjidhje të personalizuar.",
    },
    en: {
      title: "Communication Automation",
      subtitle: "Connect with your customers on any platform, automatically and efficiently.",
      description: "We provide advanced communication automation solutions, allowing you to be available for customers 24/7, manage conversations, and increase engagement.",
      cta: "Start Automating",
      featuresTitle: "Key Features",
      features: [
        {
          icon: <Smartphone className="h-8 w-8 text-primary" />,
          title: "WhatsApp Business API Integration",
          description: "Send automated messages for reservations, notifications, reminders, and special offers directly to your customers' WhatsApp."
        },
        {
          icon: <MessageCircle className="h-8 w-8 text-primary" />,
          title: "AI Chatbot for Instant Responses",
          description: "An AI that understands common questions (schedules, prices, availability) and responds automatically, freeing up your staff."
        },
        {
          icon: <div className="flex gap-2"><Instagram className="h-8 w-8 text-primary" /><Facebook className="h-8 w-8 text-primary" /></div>,
          title: "Social Media Centralization",
          description: "Connect with Instagram DM, Facebook Messenger, and Google Business Chat to manage all conversations from a single place."
        }
      ],
      processTitle: "Implementation Process",
      process: [
        { title: "Channel Analysis", description: "We identify the most important communication channels for your business.", icon: "1" },
        { title: "System Configuration", description: "We configure the APIs and build the AI logic for automated responses.", icon: "2" },
        { title: "AI Training", description: "We train the AI model with your specific business information for accurate answers.", icon: "3" },
        { title: "Activation & Monitoring", description: "We activate the system and monitor its performance to ensure efficient communication.", icon: "4" },
      ],
      finalCtaTitle: "Ready to automate your communication?",
      finalCtaDescription: "Let technology work for you. Contact us for a customized solution.",
    }
  }

export default function CommunicationAutomationPage({ searchParams }: { searchParams?: { lang?: string } }) {
  const lang = useMemo(() => searchParams?.lang === 'sq' ? 'sq' : 'en', [searchParams?.lang]);
  const currentContent = pageContent[lang];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header lang={lang} />
      <main className="flex-1 fade-in">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 text-white text-center">
            <Image 
                src="https://images.unsplash.com/photo-1611262588024-d12430b98920?q=80&w=1974&auto=format&fit=crop"
                alt="Communication Automation"
                fill
                className="object-cover"
                data-ai-hint="social media"
            />
            <div className="absolute inset-0 bg-primary/80"></div>
            <div className="container relative z-10">
                <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">{currentContent.title}</h1>
                <p className="text-lg md:text-xl max-w-3xl mx-auto">{currentContent.subtitle}</p>
            </div>
        </section>

        {/* Description Section */}
        <section className="py-16 md:py-24 bg-card">
            <div className="container text-center">
                <p className="text-xl md:text-2xl max-w-4xl mx-auto text-muted-foreground">{currentContent.description}</p>
            </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24">
            <div className="container">
                <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-12">{currentContent.featuresTitle}</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {currentContent.features.map((feature, index) => (
                        <div key={index} className="bg-card p-8 rounded-lg text-center flex flex-col items-center shadow-lg hover:shadow-primary/20 transition-shadow">
                            <div className="mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-bold mb-2 font-headline">{feature.title}</h3>
                            <p className="text-muted-foreground flex-1">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Process Section */}
        <section className="py-16 md:py-24 bg-card">
            <div className="container">
                <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-12">{currentContent.processTitle}</h2>
                <div className="relative grid md:grid-cols-4 gap-8">
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 hidden md:block"></div>
                   {currentContent.process.map((step, index) => (
                       <div key={index} className="relative flex flex-col items-center text-center">
                           <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-primary rounded-full text-primary-foreground font-bold text-xl border-4 border-card">{step.icon}</div>
                           <h3 className="mt-4 text-lg font-semibold font-headline">{step.title}</h3>
                           <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                       </div>
                   ))}
                </div>
            </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 md:py-32">
            <div className="container text-center">
                <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">{currentContent.finalCtaTitle}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-8">{currentContent.finalCtaDescription}</p>
                <Button size="lg" asChild>
                    <Link href={`/contact?lang=${lang}`}>
                        {currentContent.cta} <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>
        </section>
      </main>
      <Footer lang={lang} />
    </div>
  );
}