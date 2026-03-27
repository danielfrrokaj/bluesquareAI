'use client';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, ShoppingCart, CreditCard, CalendarCheck, Star, Store, TrendingUp } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import { FinalCtaSection } from "@/components/sections/final-cta-section";

const pageContent = {
    sq: {
      title: "Zgjidhje për Biznese Lokale",
      subtitle: "Fuqizoni restorantin, dyqanin ose shërbimin tuaj me teknologji moderne.",
      description: "Ofrojmë sisteme të integruara që thjeshtojnë menaxhimin e përditshëm, nga porositë te marketingut.",
      cta: "Kërko një Demo",
      featuresTitle: "Zgjidhje Moderne",
      features: [
        {
          icon: <ShoppingCart className="h-6 w-6" />,
          title: "Menaxhim Porosish",
          description: "Sistem i plotë për menaxhimin e porosive, inventarit dhe raportimit financiar në kohë reale."
        },
        {
          icon: <CalendarCheck className="h-6 w-6" />,
          title: "Rezervime Online",
          description: "Lejojuni klientëve të rezervojnë takime ose tavolina lehtësisht përmes platformës suaj."
        },
        {
          icon: <Star className="h-6 w-6" />,
          title: "Programe Besnikërie",
          description: "Krijoni programe shpërblyese dhe mblidhni feedback të vlefshëm automatikisht."
        }
      ],
      processTitle: "Rruga Drejt Modernizimit",
      process: [
        { title: "Analiza", description: "Studiojmë proceset tuaja aktuale dhe pikat e dobëta.", icon: "01" },
        { title: "Personalizimi", description: "Përshtasim platformën tonë për nevojat tuaja specifike.", icon: "02" },
        { title: "Instalimi", description: "Instalojmë pajisjet dhe trajnojmë stafin tuaj.", icon: "03" },
        { title: "Suporti", description: "Mbështetje teknike e vazhdueshme për rritjen tuaj.", icon: "04" },
      ]
    },
    en: {
      title: "Solutions for Local Businesses",
      subtitle: "Empower your restaurant, shop, or service with modern technology.",
      description: "We offer integrated systems that simplify daily management, from orders to marketing strategies.",
      cta: "Request a Demo",
      featuresTitle: "Modern Solutions",
      features: [
        {
          icon: <ShoppingCart className="h-6 w-6" />,
          title: "Order Management",
          description: "Complete system for managing orders, inventory, and financial reporting in real-time."
        },
        {
          icon: <CalendarCheck className="h-6 w-6" />,
          title: "Online Reservations",
          description: "Allow customers to easily book appointments or tables through your platform."
        },
        {
          icon: <Star className="h-6 w-6" />,
          title: "Loyalty Programs",
          description: "Create reward programs and gather valuable feedback automatically."
        }
      ],
      processTitle: "Road to Modernization",
      process: [
        { title: "Analysis", description: "We study your current processes and pain points.", icon: "01" },
        { title: "Customization", description: "We adapt our platform to your specific business needs.", icon: "02" },
        { title: "Installation", description: "We install hardware and train your staff properly.", icon: "03" },
        { title: "Support", description: "Ongoing technical support for your business growth.", icon: "04" },
      ]
    }
  }

export default function LocalBusinessSolutionsPage({ searchParams }: { searchParams?: { lang?: string } }) {
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
                        <Store className="h-4 w-4 mr-2 text-black" />
                        {lang === 'sq' ? 'Biznes Lokal' : 'Local Business'}
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
                        <div className="flex items-center gap-4 text-white/40">
                            <TrendingUp className="h-6 w-6" />
                            <span className="text-lg font-medium tracking-tight">
                                {lang === 'sq' ? 'Efektshmëri e rritur me 40%' : 'Efficiency increased by 40%'}
                            </span>
                        </div>
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