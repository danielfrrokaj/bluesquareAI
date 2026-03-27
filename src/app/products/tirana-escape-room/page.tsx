'use client';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Layout, Calendar, Zap, CheckCircle2, Monitor, Rocket, Lock } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import { FinalCtaSection } from "@/components/sections/final-cta-section";

const pageContent = {
    sq: {
      title: "Tirana Escape Room",
      subtitle: "Faqe interneti profesionale e ndërtuar për konvertim.",
      description: "Një faqe interneti e bukur dhe funksionale e ndërtuar për të rritur rezervimet dhe për të prezantuar dhomat e lojës në mënyrë profesionale.",
      cta: "Planifiko një Projekt",
      featuresTitle: "Përjetoni Cilësinë",
      features: [
        {
          icon: <Monitor className="h-6 w-6" />,
          title: "Dizajn Modern",
          description: "Pamje tërheqëse që funksionon në mënyrë perfekte në çdo pajisje (Mobile-First)."
        },
        {
          icon: <Calendar className="h-6 w-6" />,
          title: "Sistem Rezervimi",
          description: "Lejoni klientët të shohin disponueshmërinë në kohë reale dhe të rezervojnë direkt."
        },
        {
          icon: <Zap className="h-6 w-6" />,
          title: "Performancë e Lartë",
          description: "Shpejtësi maksimale për të reduktuar braktisjen dhe përmirësuar SEO."
        }
      ],
      benefits: [
        { title: "+150% Rezervime", description: "Proces i thjeshtë që konverton vizitorët." },
        { title: "Saktësi 100%", description: "Gabime zero në kalendarin e dhomave." },
        { title: "Prezantim Premium", description: "Galeri dhe detaje që ngjallin interes." }
      ]
    },
    en: {
      title: "Tirana Escape Room",
      subtitle: "Professional website built for ultimate conversion.",
      description: "A beautiful and functional website designed to increase bookings and showcase game rooms in a professional way.",
      cta: "Plan a Project",
      featuresTitle: "Experience Quality",
      features: [
        {
          icon: <Monitor className="h-6 w-6" />,
          title: "Modern Design",
          description: "Attractive look that works perfectly on every device (Mobile-First)."
        },
        {
          icon: <Calendar className="h-6 w-6" />,
          title: "Booking System",
          description: "Allow customers to see real-time availability and book directly online."
        },
        {
          icon: <Zap className="h-6 w-6" />,
          title: "High Performance",
          description: "Maximum speed to reduce bounce rates and improve SEO rankings."
        }
      ],
      benefits: [
        { title: "+150% Bookings", description: "Seamless process that converts visitors." },
        { title: "100% Accuracy", description: "Zero errors in the room calendar system." },
        { title: "Premium Showcase", description: "Galleries and details that spark high interest." }
      ]
    }
  }

export default function TiranaEscapeRoomPage({ searchParams }: { searchParams?: { lang?: string } }) {
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
                        <Rocket className="h-4 w-4 mr-2 text-black" />
                        {lang === 'sq' ? 'Projekt Suksesi' : 'Success Project'}
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

        {/* Project Details */}
        <section className="py-24 md:py-40 bg-black text-white">
            <div className="container">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 group">
                        <Image
                            src="https://i.postimg.cc/597FvF4H/image.png"
                            alt="Project Interface"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    </div>
                    <div>
                        <h2 className="text-4xl md:text-6xl font-extrabold font-headline mb-8 tracking-tighter leading-[1]">
                            {lang === 'sq' ? 'Diferenca Profesionale' : 'Professional Difference'}
                        </h2>
                        <p className="text-xl text-white/60 mb-12 max-w-lg leading-relaxed">
                            {currentContent.description}
                        </p>
                        <div className="space-y-6">
                            {currentContent.benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="h-2 w-2 rounded-full bg-white" />
                                    <div>
                                        <span className="font-bold mr-2">{benefit.title}:</span>
                                        <span className="text-white/60">{benefit.description}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section className="py-24 md:py-40 border-b border-black/5">
            <div className="container text-center mb-20 text-black">
                <h2 className="text-4xl md:text-6xl font-extrabold font-headline tracking-tighter">{currentContent.featuresTitle}</h2>
            </div>
            <div className="container">
                <div className="grid md:grid-cols-3 gap-8">
                    {currentContent.features.map((feature, index) => (
                        <div key={index} className="group p-10 rounded-3xl border border-black/5 bg-gray-50/50 hover:bg-white transition-all duration-500 hover:shadow-2xl hover:shadow-black/5">
                            <div className="mb-8 p-4 rounded-2xl bg-black/5 w-fit group-hover:bg-black group-hover:text-white transition-colors duration-500">
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-bold mb-4 tracking-tight">{feature.title}</h3>
                            <p className="text-black/50 leading-relaxed">
                                {feature.description}
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