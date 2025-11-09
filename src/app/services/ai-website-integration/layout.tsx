import type { Metadata, ResolvingMetadata } from 'next';

const pageContent = {
    sq: {
      title: "Integrim i AI në Website",
      subtitle: "Transformoni faqen tuaj në një mjet inteligjent marketingu dhe shërbimi ndaj klientit.",
    },
    en: {
      title: "AI Website Integration",
      subtitle: "Transform your website into an intelligent marketing and customer service tool.",
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
  const featuredImage = 'https://images.unsplash.com/photo-1554498808-d3ae8f23dd58?q=80&w=2070&auto=format&fit=crop'; // AI Integration image

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

export default function AiWebsiteIntegrationLayout({ children }: Props) {
    return <>{children}</>;
}