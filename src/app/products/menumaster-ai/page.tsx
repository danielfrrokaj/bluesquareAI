'use client';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Code, Zap, DollarSign, RefreshCw, Lightbulb, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const pageContent = {
    sq: {
      title: "MenuMaster AI: E Ardhmja e Menaxhimit të Menusë",
      subtitle: "SaaS i Fuqizuar nga AI për çmime dinamike, optimizim dhe përditësime të lehta për restorantet.",
      cta: "Kërko një Demo",
      
      aiTitle: "Si e Fuqizon AI Aplikacionet Tona",
      aiDescription: "Ne përdorim Genkit dhe modele të avancuara për të krijuar sisteme inteligjente, vetë-optimizuese që mësojnë nga të dhënat në kohë reale. Kjo siguron që MenuMaster AI të jetë gjithmonë një hap përpara, duke maksimizuar efikasitetin dhe fitimin tuaj.",
      aiFeatures: [
        {
          icon: <Code className="h-8 w-8 text-primary" />,
          title: "Vendime të Bazuara në Të Dhëna",
          description: "AI analizon shitjet, kërkesën dhe kostot e inventarit për të sugjeruar çmime dinamike dhe për të identifikuar artikujt më fitimprurës."
        },
        {
          icon: <Lightbulb className="h-8 w-8 text-primary" />,
          title: "Optimizimi i Përmbajtjes",
          description: "Gjeneron automatikisht përshkrime tërheqëse të ushqimeve, të optimizuara për të rritur shitjet dhe për të përmirësuar përvojën e klientit."
        },
        {
          icon: <Zap className="h-8 w-8 text-primary" />,
          title: "Automatizim i Fluksit të Punës",
          description: "Automatizon përditësimet e menusë në të gjitha platformat (QR, POS, website) në kohë reale, duke eliminuar gabimet manuale."
        }
      ],

      restaurantTitle: "Pse Restorantet Kanë Nevojë për MenuMaster AI",
      restaurantFeatures: [
        {
          icon: <DollarSign className="h-6 w-6 text-green-500" />,
          title: "Maksimizimi i Fitimit",
          description: "AI sugjeron çmime optimale bazuar në orën e ditës, kërkesën dhe inventarin, duke rritur marzhin e fitimit pa humbur klientë."
        },
        {
          icon: <RefreshCw className="h-6 w-6 text-primary" />,
          title: "Përditësime të Menjëhershme",
          description: "Ndryshoni çmimet ose shënoni artikujt si 'të shitur' menjëherë, duke siguruar që klientët të shohin gjithmonë informacionin më të saktë."
        },
        {
          icon: <CheckCircle2 className="h-6 w-6 text-primary" />,
          title: "Konsistencë e Markës",
          description: "Siguroni që çdo menu, qoftë dixhitale apo e printuar, të jetë e unifikuar dhe të pasqyrojë standardet e larta të markës suaj."
        }
      ],

      easeTitle: "Menaxhimi i Menusë Më i Lehtë se Kurrë",
      easeDescription: "MenuMaster AI ofron një ndërfaqe të thjeshtë dhe intuitive ku pronarët mund të përditësojnë artikujt, përshkrimet dhe çmimet menjëherë në të gjitha platformat dixhitale (kodet QR, faqja e internetit, POS). Nuk kërkohen aftësi kodimi apo dizajni. Thjesht klikoni, ndryshoni dhe publikoni.",

      finalCtaTitle: "Gati për të transformuar menunë tuaj në një mjet fitimi?",
      finalCtaDescription: "Lëreni AI të menaxhojë kompleksitetin, ndërsa ju fokusoheni në ofrimin e ushqimit të shkëlqyer.",
    },
    en: {
      title: "MenuMaster AI: The Future of Menu Management",
      subtitle: "AI-Powered SaaS for dynamic pricing, optimization, and seamless updates for restaurants.",
      cta: "Request a Demo",

      aiTitle: "How AI Powers Our Applications",
      aiDescription: "We use Genkit and advanced models to create intelligent, self-optimizing systems that learn from real-time data. This ensures MenuMaster AI is always one step ahead, maximizing your efficiency and profit.",
      aiFeatures: [
        {
          icon: <Code className="h-8 w-8 text-primary" />,
          title: "Data-Driven Decisions",
          description: "AI analyzes sales, demand, and inventory costs to suggest dynamic pricing and identify the most profitable menu items."
        },
        {
          icon: <Lightbulb className="h-8 w-8 text-primary" />,
          title: "Content Optimization",
          description: "Automatically generates compelling food descriptions optimized to boost sales and enhance the customer experience."
        },
        {
          icon: <Zap className="h-8 w-8 text-primary" />,
          title: "Workflow Automation",
          description: "Automates menu updates across all platforms (QR, POS, website) in real-time, eliminating manual errors."
        }
      ],

      restaurantTitle: "Why Restaurants Need MenuMaster AI",
      restaurantFeatures: [
        {
          icon: <DollarSign className="h-6 w-6 text-green-500" />,
          title: "Profit Maximization",
          description: "AI suggests optimal prices based on time of day, demand, and inventory, increasing profit margins without losing customers."
        },
        {
          icon: <RefreshCw className="h-6 w-6 text-primary" />,
          title: "Instant Updates",
          description: "Change prices or mark items as 'sold out' instantly, ensuring customers always see the most accurate information."
        },
        {
          icon: <CheckCircle2 className="h-6 w-6 text-primary" />,
          title: "Brand Consistency",
          description: "Ensure every menu, whether digital or printed, is unified and reflects your brand's high standards."
        }
      ],

      easeTitle: "Menu Management Made Easier Than Ever",
      easeDescription: "MenuMaster AI provides a simple, intuitive interface where owners can update items, descriptions, and prices instantly across all digital platforms (QR codes, website, POS). No coding or design skills required. Simply click, change, and publish.",

      finalCtaTitle: "Ready to turn your menu into a profit tool?",
      finalCtaDescription: "Let AI handle the complexity while you focus on delivering excellent food.",
    }
  }

export default function MenuMasterAIPage({ searchParams }: { searchParams?: { lang?: string } }) {
  const lang = useMemo(() => searchParams?.lang === 'sq' ? 'sq' : 'en', [searchParams?.lang]);
  const currentContent = pageContent[lang];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header lang={lang} />
      <main className="flex-1 fade-in">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 text-white text-center">
            <Image 
                src="https://images.unsplash.com/photo-1551029506-0807df4e2031?q=80&w=2070&auto=format&fit=crop"
                alt="Digital menu interface on a tablet in a restaurant setting."
                fill
                className="object-cover"
                data-ai-hint="digital restaurant menu"
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

        {/* AI Explanation Section */}
        <section className="py-16 md:py-24">
            <div className="container">
                <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-4">{currentContent.aiTitle}</h2>
                <p className="text-xl md:text-2xl max-w-4xl mx-auto text-muted-foreground text-center mb-12">{currentContent.aiDescription}</p>
                
                <div className="grid md:grid-cols-3 gap-8">
                    {currentContent.aiFeatures.map((feature, index) => (
                        <Card key={index} className="bg-card p-6 rounded-lg text-center flex flex-col items-center shadow-lg hover:shadow-primary/20 transition-shadow">
                            <div className="mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-bold mb-2 font-headline">{feature.title}</h3>
                            <p className="text-muted-foreground flex-1">{feature.description}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        {/* Restaurant Problem/Solution Section */}
        <section className="py-16 md:py-24 bg-card">
            <div className="container">
                <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-12">{currentContent.restaurantTitle}</h2>
                <div className="grid lg:grid-cols-3 gap-8">
                    {currentContent.restaurantFeatures.map((feature, index) => (
                        <div key={index} className="p-6 border rounded-lg flex flex-col items-start space-y-3">
                            <div className="flex items-center gap-3">
                                {feature.icon}
                                <h3 className="text-xl font-bold font-headline">{feature.title}</h3>
                            </div>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
        
        {/* Ease of Use Section */}
        <section className="py-16 md:py-24">
            <div className="container grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">{currentContent.easeTitle}</h2>
                    <p className="text-lg text-muted-foreground mb-8">{currentContent.easeDescription}</p>
                    <Button size="lg" asChild>
                        <Link href={`/contact?lang=${lang}`}>
                            {currentContent.cta} <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
                <div className="relative h-64 md:h-96 w-full rounded-xl overflow-hidden shadow-2xl shadow-primary/20">
                    <Image
                        src="/images/menumaster.png"
                        alt="MenuMaster AI Dashboard Interface"
                        fill
                        className="object-cover"
                        data-ai-hint="menu management interface"
                    />
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