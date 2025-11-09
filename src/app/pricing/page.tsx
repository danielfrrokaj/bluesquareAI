'use client';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Code, Camera, MessageCircle, ShoppingCart, Plane } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FaqSection } from "@/components/sections/faq-section";
import { useMemo } from "react";
import type { Metadata, ResolvingMetadata } from 'next';

const pageContent = {
    sq: {
      title: "Çmime Fleksibël për Çdo Biznes",
      subtitle: "Zgjidhni shërbimet që ju nevojiten dhe ne do t'ju ofrojmë një çmim të personalizuar.",
      cta: "Merr një Ofertë",
      servicesTitle: "Planet e Çmimeve për Shërbimet Tona",
      services: [
        {
          icon: <Code className="h-8 w-8 text-primary" />,
          title: "Integrim i AI në Website",
          price: "Fillestar",
          priceDescription: "nga €199",
          features: ["Chatbot Inteligjent", "Analizë Automatike e Trafikut", "Gjenerim Përmbajtje"],
          href: "/services/ai-website-integration"
        },
        {
          icon: <Camera className="h-8 w-8 text-primary" />,
          title: "Sisteme Menaxhimi & Monitorimi",
          price: "Sipas kërkesës",
          priceDescription: "Çmim i personalizuar",
          features: ["Mini-PMS për Akomodim", "Dashboard Inteligjent", "Integrim me Kamera Sigurie"],
          href: "/services/management-systems"
        },
        {
          icon: <MessageCircle className="h-8 w-8 text-primary" />,
          title: "Automatizim Komunikimi",
          price: "Fillestar",
          priceDescription: "nga €149/muaj",
          features: ["Integrim WhatsApp Business API", "AI Chatbot për Përgjigje", "Centralizim i Rrjeteve Sociale"],
          href: "/services/communication-automation"
        },
        {
          icon: <ShoppingCart className="h-8 w-8 text-primary" />,
          title: "Zgjidhje për Biznese Lokale",
          price: "Sipas kërkesës",
          priceDescription: "Çmim i personalizuar",
          features: ["Menaxhim Porosish & Pagesash", "Platformë Rezervimesh Online", "Programe Besnikërie"],
          href: "/services/local-business-solutions"
        },
        {
          icon: <Plane className="h-8 w-8 text-primary" />,
          title: "AI për Turizëm & Shërbime",
          price: "Sipas kërkesës",
          priceDescription: "Çmim i personalizuar",
          features: ["Personalized Tourism Chatbot", "Sinkronizim i Platformave", "Analizë e Komenteve me AI"],
          href: "/services/tourism-ai"
        }
      ],
      finalCtaTitle: "Nuk jeni të sigurt se cili plan është i duhuri për ju?",
      finalCtaDescription: "Ekipi ynë është i gadi t'ju ndihmojë të gjeni zgjidhjen perfekte. Na kontaktoni për një konsultë falas dhe një ofertë të personalizuar.",
    },
    en: {
      title: "Flexible Pricing for Every Business",
      subtitle: "Choose the services you need and we will provide you with a custom quote.",
      cta: "Get a Quote",
      servicesTitle: "Pricing Plans for Our Services",
      services: [
        {
          icon: <Code className="h-8 w-8 text-primary" />,
          title: "AI Website Integration",
          price: "Starting at",
          priceDescription: "from €199",
          features: ["Intelligent Chatbot", "Automatic Traffic Analysis", "Content Generation"],
          href: "/services/ai-website-integration"
        },
        {
          icon: <Camera className="h-8 w-8 text-primary" />,
          title: "Management & Monitoring Systems",
          price: "On-demand",
          priceDescription: "Custom price",
          features: ["Mini-PMS for Accommodation", "Intelligent Dashboard", "Security Camera Integration"],
          href: "/services/management-systems"
        },
        {
          icon: <MessageCircle className="h-8 w-8 text-primary" />,
          title: "Communication Automation",
          price: "Starting at",
          priceDescription: "from €149/month",
          features: ["WhatsApp Business API Integration", "AI Chatbot for Responses", "Social Media Centralization"],
          href: "/services/communication-automation"
        },
        {
          icon: <ShoppingCart className="h-8 w-8 text-primary" />,
          title: "Solutions for Local Businesses",
          price: "On-demand",
          priceDescription: "Custom price",
          features: ["Order & Payment Management", "Online Reservation Platform", "Loyalty Programs"],
          href: "/services/local-business-solutions"
        },
        {
          icon: <Plane className="h-8 w-8 text-primary" />,
          title: "AI for Tourism & Services",
          price: "On-demand",
          priceDescription: "Custom price",
          features: ["Personalized Tourism Chatbot", "Platform Synchronization", "AI Review Analysis"],
          href: "/services/tourism-ai"
        }
      ],
      finalCtaTitle: "Not sure which plan is right for you?",
      finalCtaDescription: "Our team is ready to help you find the perfect solution. Contact us for a free consultation and a personalized quote.",
    }
  }

type Props = {
  searchParams: { lang?: string };
};

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const lang = searchParams?.lang === 'sq' ? 'sq' : 'en';
  const content = pageContent[lang];
  
  const title = content.title;
  const description = content.subtitle;
  const locale = lang === 'sq' ? 'sq_AL' : 'en_US';

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      locale: locale,
      images: ['/logo.png'],
    },
    twitter: {
      title: title,
      description: description,
      images: ['/logo.png'],
    },
  };
}

export default function PricingPage({ searchParams }: { searchParams?: { lang?: string } }) {
  const lang = useMemo(() => searchParams?.lang === 'sq' ? 'sq' : 'en', [searchParams?.lang]);
  const currentContent = pageContent[lang];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header lang={lang} />
      <main className="flex-1 fade-in">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 text-white text-center">
             <Image 
                src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop"
                alt="Pricing background"
                fill
                className="object-cover"
                data-ai-hint="abstract gradient"
            />
            <div className="absolute inset-0 bg-primary/80"></div>
            <div className="container relative z-10">
                <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">{currentContent.title}</h1>
                <p className="text-lg md:text-xl max-w-3xl mx-auto text-white">{currentContent.subtitle}</p>
                 <Button size="lg" asChild className="mt-8">
                    <Link href={`/contact?lang=${lang}`}>
                        {currentContent.cta} <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>
        </section>

        {/* Services Pricing Section */}
        <section className="py-16 md:py-24">
            <div className="container">
                <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-12">{currentContent.servicesTitle}</h2>
                <div className="flex flex-wrap justify-center gap-8">
                    {currentContent.services.map((service, index) => (
                       <Card key={index} className="flex flex-col w-full sm:w-[45%] lg:w-[30%]">
                         <CardHeader className="items-center text-center">
                            {service.icon}
                           <CardTitle className="font-headline text-xl mt-4">{service.title}</CardTitle>
                           <CardDescription>{service.price}</CardDescription>
                           <p><span className="text-3xl font-bold">{service.priceDescription}</span></p>
                         </CardHeader>
                         <CardContent className="flex flex-col flex-1">
                           <ul className="space-y-3 flex-1 mb-8">
                             {service.features.map((feature, i) => (
                               <li key={i} className="flex items-center gap-2">
                                 <CheckCircle2 className="h-5 w-5 text-green-500" />
                                 <span className="text-sm text-muted-foreground">{feature}</span>
                               </li>
                             ))}
                           </ul>
                           <Button asChild variant="outline" className="w-full mt-auto">
                                <Link href={`${service.href}?lang=${lang}`}>
                                    {lang === 'sq' ? 'Mëso më shumë' : 'Learn More'}
                                </Link>
                           </Button>
                         </CardContent>
                       </Card>
                    ))}
                </div>
            </div>
        </section>

        <FaqSection lang={lang}/>

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