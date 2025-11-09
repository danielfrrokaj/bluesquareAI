
'use client';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, ShoppingCart, CreditCard, CalendarCheck, Star } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

export default function LocalBusinessSolutionsPage({ searchParams }: { searchParams?: { lang?: string } }) {
  const lang = useMemo(() => searchParams?.lang === 'sq' ? 'sq' : 'en', [searchParams?.lang]);

  const content = {
    sq: {
      title: "Zgjidhje për Biznese Lokale",
      subtitle: "Fuqizoni restorantin, dyqanin ose shërbimin tuaj me teknologji moderne.",
      description: "Ofrojmë sisteme të integruara që thjeshtojnë menaxhimin e përditshëm të biznesit tuaj, nga porositë dhe pagesat te marketingu dhe besnikëria e klientit.",
      cta: "Kërko një Demo",
      featuresTitle: "Funksionalitetet Kryesore",
      features: [
        {
          icon: <ShoppingCart className="h-8 w-8 text-primary" />,
          title: "Menaxhim Porosish & Pagesash",
          description: "Një sistem i plotë për menaxhimin e porosive, inventarit dhe raportimit financiar, i përshtatshëm për restorante, dyqane dhe servise."
        },
        {
          icon: <CalendarCheck className="h-8 w-8 text-primary" />,
          title: "Platformë Rezervimesh Online",
          description: "Lejojuni klientëve të rezervojnë takime ose tavolina lehtësisht online, duke reduktuar telefonatat dhe duke optimizuar axhendën tuaj."
        },
        {
          icon: <Star className="h-8 w-8 text-primary" />,
          title: "Programe Besnikërie & Feedback",
          description: "Krijoni programe shpërblyese për klientët besnikë dhe mblidhni feedback të vlefshëm përmes sistemeve të drejtuara nga AI."
        }
      ],
      processTitle: "Hapat e Bashkëpunimit",
      process: [
        { title: "Analiza e Proceseve", description: "Studiojmë proceset tuaja aktuale për të identifikuar pikat ku teknologjia mund të sjellë përmirësim.", icon: "1" },
        { title: "Personalizimi i Sistemit", description: "Përshtasim platformën tonë për t'iu përgjigjur specifikisht nevojave të biznesit tuaj.", icon: "2" },
        { title: "Instalimi & Trajnimi", description: "Instalojmë pajisjet (nëse nevojiten) dhe trajnojmë stafin tuaj për përdorimin efektiv të sistemit.", icon: "3" },
        { title: "Mbështetje e Vazhdueshme", description: "Ofrojmë suport teknik dhe përditësime të vazhdueshme për të garantuar funksionim të pandërprerë.", icon: "4" },
      ],
      finalCtaTitle: "Gati për ta modernizuar biznesin tuaj lokal?",
      finalCtaDescription: "Zbuloni se si zgjidhjet tona mund të rrisin efikasitetin dhe fitimet tuaja. Na kontaktoni për një konsultë falas.",
    },
    en: {
      title: "Solutions for Local Businesses",
      subtitle: "Empower your restaurant, shop, or service with modern technology.",
      description: "We offer integrated systems that simplify the daily management of your business, from orders and payments to marketing and customer loyalty.",
      cta: "Request a Demo",
      featuresTitle: "Key Features",
      features: [
        {
          icon: <ShoppingCart className="h-8 w-8 text-primary" />,
          title: "Order & Payment Management",
          description: "A complete system for managing orders, inventory, and financial reporting, suitable for restaurants, shops, and services."
        },
        {
          icon: <CalendarCheck className="h-8 w-8 text-primary" />,
          title: "Online Reservation Platform",
          description: "Allow customers to easily book appointments or tables online, reducing phone calls and optimizing your schedule."
        },
        {
          icon: <Star className="h-8 w-8 text-primary" />,
          title: "Loyalty & Feedback Programs",
          description: "Create reward programs for loyal customers and gather valuable feedback through AI-driven systems."
        }
      ],
      processTitle: "Collaboration Steps",
      process: [
        { title: "Process Analysis", description: "We study your current processes to identify areas where technology can bring improvement.", icon: "1" },
        { title: "System Customization", description: "We customize our platform to specifically meet the needs of your business.", icon: "2" },
        { title: "Installation & Training", description: "We install the necessary hardware (if needed) and train your staff for effective system use.", icon: "3" },
        { title: "Ongoing Support", description: "We provide technical support and continuous updates to ensure uninterrupted operation.", icon: "4" },
      ],
      finalCtaTitle: "Ready to modernize your local business?",
      finalCtaDescription: "Discover how our solutions can increase your efficiency and profits. Contact us for a free consultation.",
    }
  }
  const currentContent = content[lang];
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header lang={lang} />
      <main className="flex-1 fade-in">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 text-white text-center">
            <Image 
                src="https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=1974&auto=format&fit=crop"
                alt="Local Business"
                fill
                className="object-cover"
                data-ai-hint="pos system"
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
