'use client';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Layout, Calendar, Zap, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const pageContent = {
    sq: {
      title: "Tirana Escape Room: Faqe Interneti Profesionale",
      subtitle: "Një faqe interneti e bukur dhe funksionale e ndërtuar për të rritur rezervimet dhe për të prezantuar dhomat e lojës.",
      cta: "Kërko një Konsultë",
      
      featuresTitle: "Funksionalitetet Kryesore të Faqes",
      features: [
        {
          icon: <Layout className="h-8 w-8 text-primary" />,
          title: "Dizajn Modern & Reagjues",
          description: "Një pamje tërheqëse që funksionon në mënyrë perfekte në çdo pajisje, duke përmirësuar përvojën e përdoruesit."
        },
        {
          icon: <Calendar className="h-8 w-8 text-primary" />,
          title: "Sistem i Integruar Rezervimi",
          description: "Lejon klientët të shohin disponueshmërinë në kohë reale dhe të rezervojnë dhomat e lojës direkt online me pagesë të sigurt."
        },
        {
          icon: <Zap className="h-8 w-8 text-primary" />,
          title: "Optimizim i Shpejtësisë",
          description: "Faqja është ndërtuar për shpejtësi maksimale, duke reduktuar shkallën e braktisjes dhe duke përmirësuar renditjen në motorët e kërkimit."
        }
      ],

      benefitsTitle: "Përfitimet për Biznesin",
      benefits: [
        {
          icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
          title: "Rritje e Rezervimeve",
          description: "Një proces rezervimi i thjeshtë dhe i qartë konverton më shumë vizitorë në klientë pagues."
        },
        {
          icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
          title: "Prezantim Profesional",
          description: "Prezantoni dhomat tuaja të lojës me galeri imazhesh dhe përshkrime të detajuara që ngjallin interes."
        },
        {
          icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
          title: "Menaxhim i Lehtë",
          description: "Një panel administrimi i thjeshtë për të menaxhuar përmbajtjen, çmimet dhe rezervimet pa nevojë për kodim."
        }
      ],

      finalCtaTitle: "Gati për të ndërtuar faqen tuaj të ardhshme?",
      finalCtaDescription: "Nëse keni nevojë për një faqe interneti të bukur, të shpejtë dhe të optimizuar për konvertim, ne jemi partneri juaj.",
    },
    en: {
      title: "Tirana Escape Room: Professional Website",
      subtitle: "A beautiful and functional website built to increase bookings and showcase the game rooms.",
      cta: "Request a Consultation",

      featuresTitle: "Key Website Features",
      features: [
        {
          icon: <Layout className="h-8 w-8 text-primary" />,
          title: "Modern & Responsive Design",
          description: "An attractive look that works perfectly on any device, enhancing the user experience."
        },
        {
          icon: <Calendar className="h-8 w-8 text-primary" />,
          title: "Integrated Booking System",
          description: "Allows customers to see real-time availability and book game rooms directly online with secure payment."
        },
        {
          icon: <Zap className="h-8 w-8 text-primary" />,
          title: "Speed Optimization",
          description: "The site is built for maximum speed, reducing bounce rates and improving search engine rankings."
        }
      ],

      benefitsTitle: "Business Benefits",
      benefits: [
        {
          icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
          title: "Increased Bookings",
          description: "A simple and clear booking process converts more visitors into paying customers."
        },
        {
          icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
          title: "Professional Presentation",
          description: "Showcase your game rooms with image galleries and detailed descriptions that spark interest."
        },
        {
          icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
          title: "Easy Management",
          description: "A simple admin panel to manage content, prices, and bookings without needing to code."
        }
      ],

      finalCtaTitle: "Ready to build your next website?",
      finalCtaDescription: "If you need a beautiful, fast, and conversion-optimized website, we are your partner.",
    }
  }

export default function TiranaEscapeRoomPage({ searchParams }: { searchParams?: { lang?: string } }) {
  const lang = useMemo(() => searchParams?.lang === 'sq' ? 'sq' : 'en', [searchParams?.lang]);
  const currentContent = pageContent[lang];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header lang={lang} />
      <main className="flex-1 fade-in">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 text-white text-center">
            <Image 
                src="https://i.postimg.cc/597FvF4H/image.png"
                alt="Tirana Escape Room Website Screenshot"
                fill
                className="object-cover"
                data-ai-hint="escape room website interface"
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

        {/* Features Section */}
        <section className="py-16 md:py-24">
            <div className="container">
                <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-12">{currentContent.featuresTitle}</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {currentContent.features.map((feature, index) => (
                        <Card key={index} className="bg-card p-6 rounded-lg text-center flex flex-col items-center shadow-lg hover:shadow-primary/20 transition-shadow">
                            <div className="mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-bold mb-2 font-headline">{feature.title}</h3>
                            <p className="text-muted-foreground flex-1">{feature.description}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 md:py-24 bg-card">
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