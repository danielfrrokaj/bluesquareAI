import type { Metadata, ResolvingMetadata } from 'next';

const pageContent = {
    sq: {
      title: "Tirana Escape Room: Faqe Interneti Profesionale",
      subtitle: "Një faqe interneti e bukur dhe funksionale e ndërtuar për të rritur rezervimet dhe për të prezantuar dhomat e lojës.",
    },
    en: {
      title: "Tirana Escape Room: Professional Website",
      subtitle: "A beautiful and functional website built to increase bookings and showcase the game rooms.",
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
  const featuredImage = 'https://i.postimg.cc/597FvF4H/image.png';

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

export default function TiranaEscapeRoomLayout({ children }: Props) {
    return <>{children}</>;
}