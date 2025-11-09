import type { Metadata, ResolvingMetadata } from 'next';

const pageContent = {
    sq: {
      title: "Zgjidhje për Biznese Lokale",
      subtitle: "Fuqizoni restorantin, dyqanin ose shërbimin tuaj me teknologji moderne.",
    },
    en: {
      title: "Solutions for Local Businesses",
      subtitle: "Empower your restaurant, shop, or service with modern technology.",
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
  const featuredImage = 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=1974&auto=format&fit=crop'; // Local Business image

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

export default function LocalBusinessSolutionsLayout({ children }: Props) {
    return <>{children}</>;
}