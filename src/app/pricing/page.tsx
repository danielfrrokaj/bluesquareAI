'use client';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Code, Camera, MessageCircle, ShoppingCart, Plane } from "lucide-react";
import { FaqSection } from "@/components/sections/faq-section";
import { FinalCtaSection } from "@/components/sections/final-cta-section";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

const pageContent = {
    sq: {
      title: "Planet e Çmimeve",
      subtitle: "Zgjidhni shërbimet që ju nevojiten dhe ne do t'ju ofrojmë një ofertë të personalizuar për biznesin tuaj.",
      cta: "Merr një propozim",
      servicesTitle: "Zbuloni mundësitë tona",
      services: [
        {
          icon: <Code className="h-10 w-10" />,
          title: "Integrim i AI në Website",
          price: "Fillon nga",
          priceAmount: "€199",
          description: "Për biznese që duan të automatizojnë ndërveprimin me klientët në ueb.",
          features: ["Chatbot Inteligjent 24/7", "Analizë Automatike e Trafikut", "Gjenerim Përmbajtje me AI"],
          href: "/services/ai-website-integration"
        },
        {
          icon: <MessageCircle className="h-10 w-10" />,
          title: "Automatizim Komunikimi",
          price: "Fillon nga",
          priceAmount: "€149/m",
          description: "Zgjidhja perfekte për menaxhimin e porosive dhe mesazheve në shkallë.",
          features: ["WhatsApp Business API", "AI Chatbot për Përgjigje", "Centralizim i Rrjeteve Sociale"],
          href: "/services/communication-automation"
        },
        {
          icon: <Camera className="h-10 w-10" />,
          title: "Sisteme Menaxhimi",
          price: "Personalizuar",
          priceAmount: "Sipas kërkesës",
          description: "Sisteme komplekse për monitorim dhe menaxhim të operacioneve.",
          features: ["Mini-PMS për Akomodim", "Dashboard Analitik", "Integrim me Kamera Sigurie"],
          href: "/services/management-systems"
        }
      ]
    },
    en: {
      title: "Pricing Plans",
      subtitle: "Choose the services you need and we will provide you with a custom quote tailored to your business needs.",
      cta: "Get a proposal",
      servicesTitle: "Explore our options",
      services: [
        {
          icon: <Code className="h-10 w-10" />,
          title: "AI Website Integration",
          price: "Starting from",
          priceAmount: "€199",
          description: "For businesses looking to automate customer interaction on their website.",
          features: ["24/7 Intelligent Chatbot", "Automatic Traffic Analysis", "AI Content Generation"],
          href: "/services/ai-website-integration"
        },
        {
          icon: <MessageCircle className="h-10 w-10" />,
          title: "Communication Automation",
          price: "Starting from",
          priceAmount: "$149/m",
          description: "The perfect solution for managing orders and messages at scale.",
          features: ["WhatsApp Business API", "AI Chatbot for Responses", "Social Media Centralization"],
          href: "/services/communication-automation"
        },
        {
          icon: <Camera className="h-10 w-10" />,
          title: "Management Systems",
          price: "Customized",
          priceAmount: "On-demand",
          description: "Complex systems for monitoring and managing operations.",
          features: ["Mini-PMS for Accommodation", "Analytical Dashboard", "Security Camera Integration"],
          href: "/services/management-systems"
        }
      ]
    }
  }

export default function PricingPage({ searchParams }: { searchParams?: { lang?: string } }) {
  const lang = useMemo(() => searchParams?.lang === 'sq' ? 'sq' : 'en', [searchParams?.lang]);
  const currentContent = pageContent[lang];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header lang={lang} />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-50 to-transparent -z-10" />
            <div className="container relative z-10 text-center">
                <div className="inline-flex items-center rounded-full border border-black/5 bg-black/5 px-3 py-1 text-sm font-medium mb-8">
                   {lang === 'sq' ? 'Transparencë dhe Vlerë' : 'Transparency and Value'}
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold font-headline mb-8 tracking-tight text-black">
                    {currentContent.title}
                </h1>
                <p className="text-xl md:text-2xl max-w-2xl mx-auto text-black/60 leading-relaxed font-medium">
                    {currentContent.subtitle}
                </p>
            </div>
        </section>

        {/* Pricing Grid */}
        <section className="py-24 bg-white">
            <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {currentContent.services.map((service, index) => (
                       <div key={index} className={cn(
                           "relative flex flex-col p-8 rounded-3xl border transition-all duration-300 hover:shadow-xl group",
                           index === 1 ? "border-black shadow-lg scale-105 z-10 bg-white" : "border-black/5 hover:border-black/20"
                       )}>
                            {index === 1 && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {lang === 'sq' ? 'Më i Populluari' : 'Most Popular'}
                                </div>
                            )}
                            <div className="mb-8 p-3 rounded-2xl bg-black/5 w-fit group-hover:bg-black group-hover:text-white transition-colors">
                                {service.icon}
                            </div>
                            <h3 className="text-2xl font-bold mb-2 text-black">{service.title}</h3>
                            <p className="text-black/50 text-sm mb-6 font-medium leading-relaxed">{service.description}</p>
                            
                            <div className="mb-8">
                                <span className="text-sm font-bold text-black/40 block mb-1 uppercase tracking-tighter">{service.price}</span>
                                <span className="text-4xl font-extrabold text-black">{service.priceAmount}</span>
                            </div>

                            <div className="space-y-4 mb-10 flex-1">
                                {service.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/5 group-hover:bg-black/10">
                                            <CheckCircle2 className="h-3 w-3 text-black" />
                                        </div>
                                        <span className="text-sm font-medium text-black/70">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Link href={`${service.href}?lang=${lang}`}>
                                <Button className={cn(
                                    "w-full rounded-2xl py-6 font-bold text-base transition-all",
                                    index === 1 ? "bg-black text-white hover:bg-black/90" : "bg-black/5 text-black hover:bg-black/10"
                                )}>
                                    {lang === 'sq' ? 'Mëso më shumë' : 'Learn more'}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                       </div>
                    ))}
                </div>
            </div>
        </section>

        <FaqSection lang={lang}/>
        
        <FinalCtaSection lang={lang} />

      </main>
      <Footer lang={lang} />
    </div>
  );
}