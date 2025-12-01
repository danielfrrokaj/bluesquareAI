'use client';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Database, MessageSquare, DollarSign, CalendarCheck, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const pageContent = {
    sq: {
      title: "Discover Albania Ops Central: Sistemi i Plotë Operacional",
      subtitle: "Automatizime n8n për hyrje të të dhënave, mesazhe WhatsApp dhe menaxhim operativ për bizneset turistike.",
      cta: "Kërko një Konsultë",
      
      systemTitle: "Sistemi i Plotë Operacional",
      systemDescription: "Ops Central shërben si shtylla kurrizore për bizneset turistike, duke lidhur sisteme të ndryshme (rezervimet, financat, komunikimin) në një fluks pune të vetëm, të automatizuar, duke siguruar efikasitet dhe saktësi nga rezervimi deri në check-out.",
      
      modulesTitle: "Modulet Kryesore të Automatizimit",
      modules: [
        {
          icon: <Database className="h-8 w-8 text-primary" />,
          title: "Automatizimi i Hyrjes së Të Dhënave",
          description: "Sinkronizoni automatikisht të dhënat e rezervimeve nga platforma të ndryshme (Booking, Airbnb, etj.) në bazën tuaj të të dhënave, duke eliminuar gabimet manuale."
        },
        {
          icon: <MessageSquare className="h-8 w-8 text-primary" />,
          title: "Automatizimi i Komunikimit WhatsApp",
          description: "Dërgoni automatikisht konfirmime rezervimi, njoftime për pagesa dhe oferta të personalizuara klientëve përmes WhatsApp Business API."
        },
        {
          icon: <DollarSign className="h-8 w-8 text-primary" />,
          title: "Raportimi Financiar i Automatizuar",
          description: "Gjeneroni raporte financiare të shpejta dhe të sakta bazuar në të dhënat e rezervimeve në kohë reale, duke thjeshtuar faturimin dhe kontabilitetin."
        },
        {
          icon: <CalendarCheck className="h-8 w-8 text-primary" />,
          title: "Sinkronizimi i Rezervimeve në Kohë Reale",
          description: "Siguroni që kalendarët tuaj të jenë gjithmonë të përditësuar në të gjitha kanalet, duke parandaluar overbooking-un dhe duke ruajtur reputacionin tuaj."
        }
      ],

      benefitsTitle: "Përfitimet e Sistemit të Automatizuar",
      benefits: [
        {
          icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
          title: "Efikasitet Operacional",
          description: "Reduktoni kohën e shpenzuar në detyra administrative me 80%, duke lejuar stafin të fokusohet në shërbimin ndaj klientit."
        },
        {
          icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
          title: "Saktësi Financiare",
          description: "Eliminoni gabimet njerëzore në faturim dhe raportim, duke siguruar pasqyra financiare të besueshme."
        },
        {
          icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
          title: "Përvojë e Përmirësuar e Klientit",
          description: "Komunikimi i shpejtë dhe i personalizuar përmes WhatsApp rrit kënaqësinë dhe besnikërinë e klientit."
        }
      ],

      finalCtaTitle: "Gati për të automatizuar operacionet tuaja turistike?",
      finalCtaDescription: "Lëreni teknologjinë të menaxhojë kompleksitetin, ndërsa ju ofroni përvoja të paharrueshme për klientët tuaj.",
    },
    en: {
      title: "Discover Albania Ops Central: The Full Operational System",
      subtitle: "n8n automations for data entry, WhatsApp messages, and operational management for tourism businesses.",
      cta: "Request a Consultation",

      systemTitle: "The Full Operational System",
      systemDescription: "Ops Central acts as the backbone for tourism businesses, connecting disparate systems (reservations, finance, communication) into one seamless, automated workflow, ensuring efficiency and accuracy from booking to check-out.",
      
      modulesTitle: "Key Automation Modules",
      modules: [
        {
          icon: <Database className="h-8 w-8 text-primary" />,
          title: "Automated Data Entry",
          description: "Automatically sync reservation data from various platforms (Booking, Airbnb, etc.) into your central database, eliminating manual errors."
        },
        {
          icon: <MessageSquare className="h-8 w-8 text-primary" />,
          title: "WhatsApp Communication Automation",
          description: "Automatically send booking confirmations, payment notifications, and personalized offers to clients via the WhatsApp Business API."
        },
        {
          icon: <DollarSign className="h-8 w-8 text-primary" />,
          title: "Automated Financial Reporting",
          description: "Generate quick and accurate financial reports based on real-time reservation data, simplifying invoicing and accounting."
        },
        {
          icon: <CalendarCheck className="h-8 w-8 text-primary" />,
          title: "Real-Time Reservation Synchronization",
          description: "Ensure your calendars are always up-to-date across all channels, preventing overbooking and maintaining your reputation."
        }
      ],

      benefitsTitle: "Benefits of the Automated System",
      benefits: [
        {
          icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
          title: "Operational Efficiency",
          description: "Reduce time spent on administrative tasks by 80%, allowing staff to focus on customer service."
        },
        {
          icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
          title: "Financial Accuracy",
          description: "Eliminate human errors in invoicing and reporting, ensuring reliable financial statements."
        },
        {
          icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
          title: "Improved Customer Experience",
          description: "Fast and personalized communication via WhatsApp increases customer satisfaction and loyalty."
        }
      ],

      finalCtaTitle: "Ready to automate your tourism operations?",
      finalCtaDescription: "Let technology manage the complexity while you deliver unforgettable experiences for your guests.",
    }
  }

export default function DiscoverAlbaniaOpsCentralPage({ searchParams }: { searchParams?: { lang?: string } }) {
  const lang = useMemo(() => searchParams?.lang === 'sq' ? 'sq' : 'en', [searchParams?.lang]);
  const currentContent = pageContent[lang];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header lang={lang} />
      <main className="flex-1 fade-in">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 text-white text-center">
            <Image 
                src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop"
                alt="Tourism landscape"
                fill
                className="object-cover"
                data-ai-hint="tourism landscape"
            />
            <div className="absolute inset-0 bg-primary/80"></div>
            <div className="container relative z-10">
                <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">{currentContent.title}</h1>
                <p className="text-lg md:text-xl max-w-3xl mx-auto">{currentContent.subtitle}</p>
                 <Button size="lg" asChild className="mt-8">
                    <Link href={`/contact?lang=${lang}`}>
                        {currentContent.cta} <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>
        </section>

        {/* System Overview Section */}
        <section className="py-16 md:py-24">
            <div className="container grid md:grid-cols-2 gap-12 items-center">
                <div className="relative h-64 md:h-96 w-full rounded-xl overflow-hidden shadow-2xl shadow-primary/20">
                    <Image
                        src="/images/discoveralbania.png"
                        alt="Operations Dashboard Interface"
                        fill
                        className="object-cover"
                        data-ai-hint="operations dashboard"
                    />
                </div>
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">{currentContent.systemTitle}</h2>
                    <p className="text-lg text-muted-foreground mb-8">{currentContent.systemDescription}</p>
                    <Button size="lg" asChild>
                        <Link href={`/contact?lang=${lang}`}>
                            {currentContent.cta} <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>

        {/* Automation Modules Section */}
        <section className="py-16 md:py-24 bg-card">
            <div className="container">
                <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-12">{currentContent.modulesTitle}</h2>
                <div className="grid lg:grid-cols-4 gap-8">
                    {currentContent.modules.map((module, index) => (
                        <Card key={index} className="bg-background p-6 rounded-lg text-center flex flex-col items-center shadow-lg hover:shadow-primary/20 transition-shadow">
                            <div className="mb-4">{module.icon}</div>
                            <h3 className="text-xl font-bold mb-2 font-headline">{module.title}</h3>
                            <p className="text-muted-foreground flex-1">{module.description}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 md:py-24">
            <div className="container">
                <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-12">{currentContent.benefitsTitle}</h2>
                <div className="grid lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    {currentContent.benefits.map((benefit, index) => (
                        <div key={index} className="p-6 border rounded-lg flex flex-col items-start space-y-3">
                            <div className="flex items-center gap-3">
                                {benefit.icon}
                                <h3 className="text-xl font-bold font-headline">{benefit.title}</h3>
                            </div>
                            <p className="text-muted-foreground">{benefit.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 md:py-32 bg-card">
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