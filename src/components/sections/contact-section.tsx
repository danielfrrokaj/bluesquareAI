'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { submitContactForm } from '@/app/actions';
import { Phone, Mail, Loader2 } from 'lucide-react';

type ContactSectionProps = {
  lang: 'en' | 'sq';
};

const translations = {
  en: {
    title: 'Contact Us',
    subtitle: 'Get in touch with us for any inquiries or to discuss your next project.',
    phone: 'Phone',
    email: 'Email',
    form: {
      name: 'Name',
      namePlaceholder: 'Your Name',
      email: 'Email',
      emailPlaceholder: 'your.email@example.com',
      message: 'Message',
      messagePlaceholder: 'How can we help you?',
      submit: 'Send Message',
      submitting: 'Sending...',
    },
    toast: {
      successTitle: 'Message Sent!',
      successDescription: 'Thank you for contacting us. We will get back to you shortly.',
      errorTitle: 'Uh oh! Something went wrong.',
      errorDescription: 'There was a problem with your request.',
    },
  },
  sq: {
    title: 'Na Kontaktoni',
    subtitle: 'Kontaktoni me ne për çdo pyetje ose për të diskutuar projektin tuaj të ardhshëm.',
    phone: 'Telefoni',
    email: 'Email',
    form: {
      name: 'Emri',
      namePlaceholder: 'Emri juaj',
      email: 'Email',
      emailPlaceholder: 'emaili.juaj@example.com',
      message: 'Mesazhi',
      messagePlaceholder: 'Si mund t\'ju ndihmojmë?',
      submit: 'Dërgo Mesazhin',
      submitting: 'Duke dërguar...',
    },
    toast: {
      successTitle: 'Mesazhi u Dërgua!',
      successDescription: 'Faleminderit që na kontaktuat. Do t\'ju përgjigjemi së shpejti.',
      errorTitle: 'Oh jo! Diçka shkoi keq.',
      errorDescription: 'Pati një problem me kërkesën tuaj.',
    },
  },
};

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
});

export function ContactSection({ lang }: ContactSectionProps) {
  const t = translations[lang];
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await submitContactForm(values);

    if (result.success) {
      toast({
        title: t.toast.successTitle,
        description: t.toast.successDescription,
      });
      form.reset();
    } else {
      toast({
        variant: 'destructive',
        title: t.toast.errorTitle,
        description: result.error || t.toast.errorDescription,
      });
    }
  }

  return (
    <section id="contact" className="border-t">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">{t.title}</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {t.subtitle}
            </p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Phone className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">{t.phone}</h3>
                <a href="tel:+355123456789" className="text-muted-foreground hover:text-primary">
                  +355 123 456 789
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Mail className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">{t.email}</h3>
                <a href="mailto:contact@bluesquare.ai" className="text-muted-foreground hover:text-primary">
                  contact@bluesquare.ai
                </a>
              </div>
            </div>
          </div>
          <div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.form.name}</FormLabel>
                      <FormControl>
                        <Input placeholder={t.form.namePlaceholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.form.email}</FormLabel>
                      <FormControl>
                        <Input placeholder={t.form.emailPlaceholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.form.message}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t.form.messagePlaceholder} className="min-h-[120px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmitting}>
                   {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                   {isSubmitting ? t.form.submitting : t.form.submit}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
}
