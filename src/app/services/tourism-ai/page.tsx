'use client';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Plane, Bot, BarChartHorizontal, MessageSquare, Compass, MapPin, Star } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import { FinalCtaSection } from "@/components/sections/final-cta-section";

const pageContent = {
    sq: {
      title: "AI për Turizëm & Shërbime",
      subtitle: "Përmirësoni eksperiencën e vizitorëve dhe optimizoni menaxhimin e biznesit tuaj turistik.",
      description: "Sjellim zgjidhje AI të dedikuara për hotelet, agjencitë turistike dhe bizneset e shërbimeve, duke automatizuar detyrat dhe duke ofruar shërbim superior 24/7.",
      cta: "Transformo Biznesin Tënd",
      featuresTitle: "Inovacion në Turizëm",
      features: [
        {
          icon: <Compass className="h-6 w-6" />,
          title: "Asistent Virtual Turistik",
          description: "Një AI që sugjeron aktivitete, ture dhe oferta sipas profilit dhe preferencave të klientit në kohë reale."
        },
        {
          icon: <MapPin className="h-6 w-6" />,
          title: "Sinkronizim Kanalash",
          description: "Integrim i plotë me Booking.com, Airbnb dhe platformat kryesore për të menaxhuar rezervimet pa gabime."
        },
        {
          icon: <Star className="h-6 w-6" />,
          title: "Analizë e Reputationit",
          description: "Sisteme inteligjente që analizojnë komentet e klientëve për të identifikuar pikat e forta dhe mundësitë për rritje."
        }
      ],
      processTitle: "Udhëtimi Drejt Suksesit",
      process: [
        { title: "Analiza e Eksperiencës", description: "Vlerësojmë udhëtimin e klientit për të gjetur pikat kyçe për AI.", icon: "01" },
        { title: "Zhvillimi", description: "Ndërtojmë chatbot-in dhe konfigurojmë integrimet me platformat tuaja.", icon: "02" },
        { title: "Testimi", description: "Testojmë çdo skenar për të siguruar një shërbim të përsosur.", icon: "03" },
        { title: "Lansimi", description: "Aktivizojmë sistemin dhe monitorojmë feedback-un e parë.", icon: "04" },
      ]
    },
    en: {
      title: "AI for Tourism & Services",
      subtitle: "Enhance the visitor experience and optimize the management of your tourism business.",
      description: "We bring dedicated AI solutions for hotels, travel agencies, and service businesses, automating tasks and providing superior service 24/7.",
      cta: "Transform Your Business",
      featuresTitle: "Innovation in Tourism",
      features: [
        {
          icon: <Compass className="h-6 w-6" />,
          title: "Virtual Tourism Assistant",
          description: "An AI that suggests activities, tours, and offers according to the client's profile and preferences in real-time."
        },
        {
          icon: <MapPin className="h-6 w-6" />,
          title: "Channel Synchronization",
          description: "Full integration with Booking.com, Airbnb, and leading platforms to manage reservations flawlessly."
        },
        {
          icon: <Star className="h-6 w-6" />,
          title: "Reputation Analysis",
          description: "Intelligent systems that analyze customer reviews to identify strengths and growth opportunities."
        }
      ],
      processTitle: "Journey to Success",
      process: [
        { title: "Experience Analysis", description: "We evaluate the customer journey to find key points for AI integration.", icon: "01" },
        { title: "Development", description: "We build the chatbot and configure integrations with your platforms.", icon: "02" },
        { title: "Testing", description: "We test every scenario to ensure perfect service delivery.", icon: "03" },
        { title: "Launch", description: "We activate the system and monitor initial user feedback.", icon: "04" },
      ]
    }
  }

export default function TourismAiPage({ searchParams }: { searchParams?: { lang?: string } }) {
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
                        <Plane className="h-4 w-4 mr-2 text-black" />
                        {lang === 'sq' ? 'Teknologjia e Mikpritjes' : 'Hospitality Technology'}
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