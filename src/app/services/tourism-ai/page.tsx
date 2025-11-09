'use client';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Plane, Bot, BarChartHorizontal, MessageSquare } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

const pageContent = {
    sq: {
      title: "AI për Turizëm & Shërbime",
      subtitle: "Përmirësoni eksperiencën e vizitorëve dhe optimizoni menaxhimin e biznesit tuaj turistik.",
      description: "Sjellim zgjidhje AI të dedikuara për hotelet, agjencitë turistike dhe bizneset e shërbimeve, duke automatizuar detyrat dhe duke ofruar shërbim superior.",
      cta: "Transformo Biznesin Tënd",
      featuresTitle: "Funksionalitetet Kryesore",
      features: [
        {
          icon: <Bot className="h-8 w-8 text-primary" />,
          title: "Chatbot Turistik i Personalizuar",
          description: "Një asistent virtual për hotelin ose agjencinë tuaj që sugjeron aktivitete, ture dhe oferta sipas profilit dhe preferencave të klientit."
        },
        {
          icon: <BarChartHorizontal className="h-8 w-8 text-primary" />,
          title: "Sinkronizim i Platformave të Rezervimit",
          description: "Integrim i plotë me Booking.com, Airbnb, GetYourGuide, etj., për të menaxhuar të gjitha rezervimet në një kalendar të vetëm."
        },
        {
          icon: <MessageSquare className="h-8 w-8 text-primary" />,
          title: "Analizë e Komenteve me AI",
          description: "Sisteme inteligjente që analizojnë automatikisht komentet e klientëve (reviews) për të identifikuar pikat e forta dhe për të përmirësuar shërbimin."
        }
      ],
      processTitle: "Procesi i Integrimit",
      process: [
        { title: "Analiza e Eksperiencës", description: "Vlerësojmë udhëtimin e klientit (customer journey) për të gjetur mundësitë e automatizimit.", icon: "1" },
        { title: "Zhvillimi i Zgjidhjes", description: "Ndërtojmë chatbot-in dhe konfigurojmë integrimet me platformat tuaja të rezervimit.", icon: "2" },
        { title: "Testimi në Mjedis Real", description: "Testojmë zgjidhjen me skenarë realë për të siguruar funksionim të përsosur dhe pa gabime.", icon: "3" },
        { title: "Aktivizimi & Përmirësimi", description: "Lansojmë sistemin dhe e përmirësojmë vazhdimisht bazuar në të dhënat dhe feedback-un e mbledhur.", icon: "4" },
      ],
      finalCtaTitle: "Gati për të revolucionarizuar biznesin tuaj turistik?",
      finalCtaDescription: "Ofroni një eksperiencë të paharrueshme për klientët tuaj dhe menaxhoni operacionet me lehtësi. Na kontaktoni sot!",
    },
    en: {
      title: "AI for Tourism & Services",
      subtitle: "Enhance the visitor experience and optimize the management of your tourism business.",
      description: "We bring dedicated AI solutions for hotels, travel agencies, and service businesses, automating tasks and providing superior service.",
      cta: "Transform Your Business",
      featuresTitle: "Key Features",
      features: [
        {
          icon: <Bot className="h-8 w-8 text-primary" />,
          title: "Personalized Tourism Chatbot",
          description: "A virtual assistant for your hotel or agency that suggests activities, tours, and offers according to the client's profile and preferences."
        },
        {
          icon: <BarChartHorizontal className="h-8 w-8 text-primary" />,
          title: "Booking Platform Synchronization",
          description: "Full integration with Booking.com, Airbnb, GetYourGuide, etc., to manage all reservations in a single calendar."
        },
        {
          icon: <MessageSquare className="h-8 w-8 text-primary" />,
          title: "AI-Powered Review Analysis",
          description: "Intelligent systems that automatically analyze customer reviews to identify strengths and improve service."
        }
      ],
      processTitle: "Integration Process",
      process: [
        { title: "Experience Analysis", description: "We evaluate the customer journey to find automation opportunities.", icon: "1" },
        { title: "Solution Development", description: "We build the chatbot and configure integrations with your booking platforms.", icon: "2" },
        { title: "Real-World Testing", description: "We test the solution with real scenarios to ensure flawless and error-free operation.", icon: "3" },
        { title: "Activation & Improvement", description: "We launch the system and continuously improve it based on the data and feedback collected.", icon: "4" },
      ],
      finalCtaTitle: "Ready to revolutionize your tourism business?",
      finalCtaDescription: "Offer an unforgettable experience for your customers and manage operations with ease. Contact us today!",
    }
  }

export default function TourismAiPage({ searchParams }: { searchParams?: { lang?: string } }) {
  const lang = useMemo(() => searchParams?.lang === 'sq' ? 'sq' : 'en', [searchParams?.lang]);
  const currentContent = pageContent[lang];
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header lang={lang} />
      <main className="flex-1 fade-in">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 text-white text-center">
            <Image 
                src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop"
                alt="Tourism AI"
                fill
                className="object-cover"
                data-ai-hint="tourism landscape"
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