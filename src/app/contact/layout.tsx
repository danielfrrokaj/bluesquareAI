import type { Metadata, ResolvingMetadata } from 'next';

const pageContent = {
    sq: {
        title: "Na Kontaktoni",
        subtitle: "Keni një pyetje apo dëshironi të punojmë së bashku? Na shkruani.",
    },
    en: {
        title: "Get in Touch",
        subtitle: "Have a question or want to work together? We'd love to hear from you.",
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
  const featuredImage = 'https://images.unsplash.com/photo-1522071820081-009f0129c7c5?q=80&w=2070&auto=format&fit=crop'; // Office/Contact image

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

export default function ContactLayout({ children }: Props) {
    return <>{children}</>;
}