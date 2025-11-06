type VisionSectionProps = {
  lang: 'en' | 'sq';
};

const translations = {
  en: {
    title: 'Our Vision',
    text: 'Blue Square AI will become the leading partner for any business looking to digitize, without the need for programmers or developers. With modern AI and automation technology, we offer fast, efficient, and personalized solutions that increase productivity and reduce costs.',
  },
  sq: {
    title: 'Vizioni Ynë',
    text: 'Blue Square AI do të bëhet partneri kryesor për çdo biznes që kërkon të dixhitalizohet, pa pasur nevojë për programues apo zhvillues. Me teknologjinë moderne të AI dhe automatizimit, ne ofrojmë zgjidhje të shpejta, efikase dhe të personalizuara që rritin produktivitetin dhe uljen e kostove.',
  },
};

export function VisionSection({ lang }: VisionSectionProps) {
  const t = translations[lang];
  return (
    <section id="vision" className="bg-card">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">{t.title}</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {t.text}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
