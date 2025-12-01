import type { Metadata, ResolvingMetadata } from 'next';

const pageContent = {
    sq: {
      title: "Discover Albania Ops Central: Sistemi i Plotë Operacional",
      subtitle: "Automatizime n8n për hyrje të të dhënave, mesazhe WhatsApp dhe menaxhim operativ për bizneset turistike.",
    },
    en: {
      title: "Discover Albania Ops Central: The Full Operational System",
      subtitle: "n8n automations for data entry, WhatsApp messages, and operational management for tourism businesses.",
    }
  }

type Props = {
  searchParams: { lang?: string };
  children: React.ReactNode;
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
  const featuredImage = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop'; // Tourism AI image

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      locale: locale,
      images: [
        {
          url: featuredImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [featuredImage],
    },
  };
}

export default function DiscoverAlbaniaOpsCentralLayout({ children }: Props) {
    return <>{children}</>;
}