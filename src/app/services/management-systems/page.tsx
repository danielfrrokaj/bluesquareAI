'use client';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Building, LayoutDashboard, Video, UserCheck } from "lucide-react";
import Image from "next/image";

export default function ManagementSystemsPage({ searchParams }: { searchParams: { lang: string } }) {
  const lang = searchParams.lang === 'sq' ? 'sq' : 'en';

  const content = {
    sq: {
      title: "Sisteme Menaxhimi & Monitorimi",
      subtitle: "Kontroll i plotë dhe vizibilitet në kohë reale mbi operacionet tuaja.",
      description: "Ne ndërtojmë sisteme të personalizuara menaxhimi dhe monitorimi që centralizojnë të dhënat, automatizojnë raportimin dhe rrisin sigurinë e biznesit tuaj.",
      cta: "Planifiko një Konsultë",
      featuresTitle: "Funksionalitetet Kryesore",
      features: [
        {
          icon: <Building className="h-8 w-8 text-primary" />,
          title: "Mini-PMS për Akomodim",
          description: "Sistem menaxhimi pronash (Property Management System) i lehtë për t'u përdorur, ideal për hotele, apartamente dhe B&B."
        },
        {
          icon: <LayoutDashboard className="h-8 w-8 text-primary" />,
          title: "Dashboard Inteligjent",
          description: "Një panel kontrolli i unifikuar për menaxhimin e shitjeve, rezervimeve, financave dhe performancës së stafit në kohë reale."
        },
        {
          icon: <Video className="h-8 w-8 text-primary" />,
          title: "Integrim me Kamera Sigurie & AI Vision",
          description: "Përdorni AI për numërimin e vizitorëve, detektimin e lëvizjeve të dyshimta dhe monitorimin e aktivitetit në hapësirën tuaj."
        }
      ],
      processTitle: "Procesi i Implementimit",
      process: [
        { title: "Vlerësimi i Nevojave", description: "Analizojmë kërkesat tuaja specifike për menaxhim dhe monitorim.", icon: "1" },
        { title: "Dizajnimi i Sistemit", description: "Projektojmë një arkitekturë të personalizuar që integron të gjitha pikat e nevojshme të të dhënave.", icon: "2" },
        { title: "Zhvillimi & Instalimi", description: "Ndërtojmë dhe instalojmë sistemin, duke siguruar integrim të plotë me pajisjet ekzistuese.", icon: "3" },
        { title: "Mirëmbajtja & Suporti", description: "Ofrojmë mirëmbajtje proaktive dhe suport teknik për të siguruar funksionim të pandërprerë.", icon: "4" },
      ],
      finalCtaTitle: "Doni të keni kontroll të plotë mbi biznesin tuaj?",
      finalCtaDescription: "Zbuloni se si sistemet tona inteligjente mund t'ju japin qartësi dhe kontroll total. Na kontaktoni për një zgjidhje të përshtatur.",
    },
    en: {
      title: "Management & Monitoring Systems",
      subtitle: "Complete control and real-time visibility over your operations.",
      description: "We build custom management and monitoring systems that centralize data, automate reporting, and enhance the security of your business.",
      cta: "Schedule a Consultation",
      featuresTitle: "Key Features",
      features: [
        {
          icon: <Building className="h-8 w-8 text-primary" />,
          title: "Mini-PMS for Accommodation",
          description: "An easy-to-use Property Management System, ideal for hotels, apartments, and B&Bs."
        },
        {
          icon: <LayoutDashboard className="h-8 w-8 text-primary" />,
          title: "Intelligent Dashboard",
          description: "A unified control panel for managing sales, reservations, finances, and staff performance in real-time."
        },
        {
          icon: <Video className="h-8 w-8 text-primary" />,
          title: "Security Camera & AI Vision Integration",
          description: "Use AI for visitor counting, suspicious motion detection, and activity monitoring in your space."
        }
      ],
      processTitle: "Implementation Process",
      process: [
        { title: "Needs Assessment", description: "We analyze your specific management and monitoring requirements.", icon: "1" },
        { title: "System Design", description: "We design a custom architecture that integrates all necessary data points.", icon: "2" },
        { title: "Development & Installation", description: "We build and install the system, ensuring full integration with existing hardware.", icon: "3" },
        { title: "Maintenance & Support", description: "We offer proactive maintenance and technical support to ensure uninterrupted operation.", icon: "4" },
      ],
      finalCtaTitle: "Want to have complete control over your business?",
      finalCtaDescription: "Discover how our intelligent systems can give you clarity and total control. Contact us for a tailored solution.",
    }
  }
  const currentContent = content[lang];
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header lang={lang} />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 text-white text-center">
            <Image 
                src="https://images.unsplash.com/photo-1585028434113-62f41582a469?q=80&w=2070&auto=format&fit=crop"
                alt="Management Systems"
                fill
                className="object-cover"
                data-ai-hint="data dashboard"
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
                    <Link href={`/#contact`}>
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
