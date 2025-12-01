import type { Metadata, ResolvingMetadata } from 'next';

const pageContent = {
    sq: {
      title: "MenuMaster AI: E Ardhmja e Menaxhimit të Menusë",
      subtitle: "SaaS i Fuqizuar nga AI për çmime dinamike, optimizim dhe përditësime të lehta për restorantet.",
    },
    en: {
      title: "MenuMaster AI: The Future of Menu Management",
      subtitle: "AI-Powered SaaS for dynamic pricing, optimization, and seamless updates for restaurants.",
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
  const featuredImage = 'https://images.unsplash.com/photo-1551029506-0807df4e2031?q=80&w=2070&auto=format&fit=crop'; // Digital menu image

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

export default function MenuMasterAILayout({ children }: Props) {
    return <>{children}</>;
}