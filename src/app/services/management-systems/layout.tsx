import type { Metadata, ResolvingMetadata } from 'next';

const pageContent = {
    sq: {
      title: "Sisteme Menaxhimi & Monitorimi",
      subtitle: "Kontroll i plotë dhe vizibilitet në kohë reale mbi operacionet tuaja.",
    },
    en: {
      title: "Management & Monitoring Systems",
      subtitle: "Complete control and real-time visibility over your operations.",
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
  const featuredImage = 'https://images.unsplash.com/photo-1585028434113-62f41582a469?q=80&w=2070&auto=format&fit=crop'; // Management Systems image

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

export default function ManagementSystemsLayout({ children }: Props) {
    return <>{children}</>;
}