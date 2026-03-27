'use client';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Code, Zap, DollarSign, RefreshCw, Lightbulb, CheckCircle2, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import { FinalCtaSection } from "@/components/sections/final-cta-section";
import { cn } from "@/lib/utils";

const pageContent = {
    sq: {
      title: "MenuMaster AI",
      subtitle: "E Ardhmja e Menaxhimit të Menusë",
      description: "SaaS i Fuqizuar nga AI për çmime dinamike, optimizim dhe përditësime të lehta për restorantet që kërkojnë përsosmëri.",
      cta: "Kërko një Demo",
      
      aiTitle: "Inteligjenca pas Menusë",
      aiDescription: "Ne përdorim modele të avancuara të AI për të krijuar sisteme vetë-optimizuese që mësojnë nga të dhënat në kohë reale.",
      aiFeatures: [
        {
          icon: <Code className="h-6 w-6" />,
          title: "Vendime me Të Dhëna",
          description: "AI analizon shitjet dhe kërkesën për të sugjeruar çmime dinamike dhe për të rritur fitimin."
        },
        {
          icon: <Lightbulb className="h-6 w-6" />,
          title: "Përshkrime AI",
          description: "Gjeneron automatikisht përshkrime tërheqëse të ushqimeve, të optimizuara për të rritur shitjet."
        },
        {
          icon: <Zap className="h-6 w-6" />,
          title: "Përditësim Real-time",
          description: "Përditëson menunë në të gjitha platformat (QR, POS, website) në sekonda, pa gabime."
        }
      ],

      restaurantTitle: "Pse ju nevojitet MenuMaster?",
      restaurantFeatures: [
        {
          icon: <DollarSign className="h-5 w-5" />,
          title: "Maksimizimi i Fitimit",
          description: "Sugjerime optimale çmimesh bazuar në kërkesën dhe orarin."
        },
        {
          icon: <RefreshCw className="h-5 w-5" />,
          title: "Instant Updates",
          description: "Ndryshoni çmimet ose hiqni artikujt nga shitja menjëherë."
        },
        {
          icon: <CheckCircle2 className="h-5 w-5" />,
          title: "Konsistencë",
          description: "Menu e unifikuar në të gjitha kanalet e komunikimit."
        }
      ],

      easeTitle: "Menaxhimi Më i Lehtë",
      easeDescription: "MenuMaster AI ofron një ndërfaqe të thjeshtë ku mund të përditësoni gjithçka pa pasur nevojë për kodim apo dizajn. Thjesht klikoni dhe publikoni.",
    },
    en: {
      title: "MenuMaster AI",
      subtitle: "The Future of Menu Management",
      description: "AI-Powered SaaS for dynamic pricing, optimization, and seamless updates for restaurants aiming for excellence.",
      cta: "Request a Demo",

      aiTitle: "Intelligence Behind the Menu",
      aiDescription: "We use advanced AI models to create self-optimizing systems that learn from real-time data.",
      aiFeatures: [
        {
          icon: <Code className="h-6 w-6" />,
          title: "Data-Driven Decisions",
          description: "AI analyzes sales and demand to suggest dynamic pricing and increase profit."
        },
        {
          icon: <Lightbulb className="h-6 w-6" />,
          title: "AI Descriptions",
          description: "Automatically generates compelling food descriptions optimized to boost sales."
        },
        {
          icon: <Zap className="h-6 w-6" />,
          title: "Real-time Updates",
          description: "Updates the menu across all platforms (QR, POS, website) in seconds, without errors."
        }
      ],

      restaurantTitle: "Why you need MenuMaster?",
      restaurantFeatures: [
        {
          icon: <DollarSign className="h-5 w-5" />,
          title: "Profit Maximization",
          description: "Optimal pricing suggestions based on demand and time."
        },
        {
          icon: <RefreshCw className="h-5 w-5" />,
          title: "Instant Updates",
          description: "Change prices or remove items from sale instantly."
        },
        {
          icon: <CheckCircle2 className="h-5 w-5" />,
          title: "Consistency",
          description: "Unified menu across all communication channels."
        }
      ],

      easeTitle: "Management Made Easy",
      easeDescription: "MenuMaster AI provides a simple interface where you can update everything without needing coding or design. Just click and publish.",
    }
  }

export default function MenuMasterAIPage({ searchParams }: { searchParams?: { lang?: string } }) {
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
                <div className="max-w-4xl">
                    <div className="inline-flex items-center rounded-full border border-black/5 bg-black/5 px-3 py-1 text-sm font-medium mb-8">
                        <UtensilsCrossed className="h-4 w-4 mr-2 text-black" />
                        {lang === 'sq' ? 'Zgjidhje për Gastronominë' : 'Gastronomy Solution'}
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

        {/* AI Explanation Section */}
        <section className="py-24 md:py-40 bg-black text-white">
            <div className="container">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-4xl md:text-6xl font-extrabold font-headline tracking-tighter mb-6">{currentContent.aiTitle}</h2>
                    <p className="text-xl text-white/60 leading-relaxed italic border-l-2 border-white/20 pl-6">
                        {currentContent.aiDescription}
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    {currentContent.aiFeatures.map((feature, index) => (
                        <div key={index} className="p-8 rounded-3xl border border-white/10 bg-white/5 hover:bg-white hover:text-black transition-all duration-500">
                            <div className="p-3 rounded-2xl bg-white/10 group-hover:bg-black/5 w-fit mb-6">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-4 tracking-tight">{feature.title}</h3>
                            <p className="text-white/40 leading-relaxed group-hover:text-black/60">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Restaurant Benefits Section */}
        <section className="py-24 md:py-40 border-b border-black/5">
            <div className="container">
                <div className="grid lg:grid-cols-2 gap-24 items-center">
                    <div>
                        <h2 className="text-4xl md:text-6xl font-extrabold font-headline tracking-tighter mb-12">{currentContent.restaurantTitle}</h2>
                        <div className="space-y-12">
                            {currentContent.restaurantFeatures.map((feature, index) => (
                                <div key={index} className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center">
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2 tracking-tight">{feature.title}</h3>
                                        <p className="text-black/50 leading-relaxed">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-gray-100 group">
                        <Image
                            src="https://images.unsplash.com/photo-1551029506-0807df4e2031?q=80&w=2070&auto=format&fit=crop"
                            alt="Menu Management"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-12">
                            <p className="text-white text-lg font-medium italic">"Optimizim në çdo sekondë."</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        
        {/* Ease of Use Section */}
        <section className="py-24 md:py-40 bg-gray-50">
            <div className="container">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-6xl font-extrabold font-headline tracking-tighter mb-8">{currentContent.easeTitle}</h2>
                    <p className="text-xl md:text-2xl text-black/60 leading-relaxed mb-12">
                        {currentContent.easeDescription}
                    </p>
                    <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-black/5">
                         <Image
                            src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop"
                            alt="Dashboard Mockup"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>
            </div>
        </section>

        <FinalCtaSection lang={lang} />
      </main>
      <Footer lang={lang} />
    </div>
  );
}