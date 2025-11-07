'use client';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Bot, PenSquare, Search, CheckCircle, BarChart2 } from "lucide-react";
import Image from "next/image";

export default function AiWebsiteIntegrationPage({ searchParams }: { searchParams: { lang: string } }) {
  const lang = searchParams.lang === 'sq' ? 'sq' : 'en';

  const content = {
    sq: {
      title: "Integrim i AI në Website",
      subtitle: "Transformoni faqen tuaj në një mjet inteligjent marketingu dhe shërbimi ndaj klientit.",
      description: "Ne integrojmë teknologjinë më të fundit të AI për të automatizuar proceset, për të kuptuar më mirë klientët tuaj dhe për të rritur ndjeshëm prezencën tuaj online.",
      cta: "Diskuto Projektin Tënd",
      featuresTitle: "Funksionalitetet Kryesore",
      features: [
        {
          icon: <Bot className="h-8 w-8 text-primary" />,
          title: "Chatbot Inteligjent 24/7",
          description: "Një asistent virtual që i përgjigjet pyetjeve, mbledh kontakte dhe ofron mbështetje për klientët në çdo kohë, pa ndërhyrje njerëzore."
        },
        {
          icon: <BarChart2 className="h-8 w-8 text-primary" />,
          title: "Analizë Automatike e Trafikut",
          description: "Kuptoni sjelljen e vizitorëve dhe zbuloni se çfarë kërkojnë ata në faqen tuaj përmes raporteve të detajuara dhe vizualizimeve të qarta."
        },
        {
          icon: <PenSquare className="h-8 w-8 text-primary" />,
          title: "Gjenerim Automatik i Përmbajtjes",
          description: "Kurseni kohë duke krijuar automatikisht përshkrime produktesh, artikuj blogu dhe përmbajtje SEO të optimizuar për motorët e kërkimit."
        }
      ],
      processTitle: "Si Funksionon?",
      process: [
        { title: "Konsultimi Fillestar", description: "Diskutojmë nevojat dhe objektivat tuaja për të përcaktuar strategjinë e duhur të integrimit.", icon: "1" },
        { title: "Zhvillimi & Integrimi", description: "Ekipi ynë zhvillon dhe integron zgjidhjet e AI në infrastrukturën ekzistuese të faqes suaj.", icon: "2" },
        { title: "Testimi & Optimizimi", description: "Sigurohemi që çdo gjë funksionon pa probleme dhe optimizojmë performancën për rezultate maksimale.", icon: "3" },
        { title: "Lansimi & Mbështetja", description: "Lansojmë zgjidhjen dhe ofrojmë mbështetje të vazhdueshme për të siguruar suksesin tuaj afatgjatë.", icon: "4" },
      ],
      finalCtaTitle: "Gati për të fuqizuar faqen tuaj me AI?",
      finalCtaDescription: "Na kontaktoni sot për të mësuar se si mund ta çojmë biznesin tuaj në një nivel tjetër.",
    },
    en: {
      title: "AI Website Integration",
      subtitle: "Transform your website into an intelligent marketing and customer service tool.",
      description: "We integrate the latest AI technology to automate processes, better understand your customers, and significantly increase your online presence.",
      cta: "Discuss Your Project",
      featuresTitle: "Key Features",
      features: [
        {
          icon: <Bot className="h-8 w-8 text-primary" />,
          title: "24/7 Intelligent Chatbot",
          description: "A virtual assistant that answers questions, collects leads, and provides customer support at any time, without human intervention."
        },
        {
          icon: <BarChart2 className="h-8 w-8 text-primary" />,
          title: "Automatic Traffic Analysis",
          description: "Understand visitor behavior and discover what they are looking for on your site through detailed reports and clear visualizations."
        },
        {
          icon: <PenSquare className="h-8 w-8 text-primary" />,
          title: "Automatic Content Generation",
          description: "Save time by automatically creating product descriptions, blog articles, and SEO content optimized for search engines."
        }
      ],
      processTitle: "How It Works",
      process: [
        { title: "Initial Consultation", description: "We discuss your needs and objectives to determine the right integration strategy.", icon: "1" },
        { title: "Development & Integration", description: "Our team develops and integrates AI solutions into your existing website infrastructure.", icon: "2" },
        { title: "Testing & Optimization", description: "We ensure everything works smoothly and optimize performance for maximum results.", icon: "3" },
        { title: "Launch & Support", description: "We launch the solution and provide ongoing support to ensure your long-term success.", icon: "4" },
      ],
      finalCtaTitle: "Ready to power up your website with AI?",
      finalCtaDescription: "Contact us today to learn how we can take your business to the next level.",
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
                src="https://images.unsplash.com/photo-1554498808-d3ae8f23dd58?q=80&w=2070&auto=format&fit=crop"
                alt="AI Integration"
                fill
                className="object-cover"
                data-ai-hint="abstract technology"
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
