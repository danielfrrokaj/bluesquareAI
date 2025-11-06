'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { handleContentGeneration } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  topic: z.string().min(3, { message: 'Tema duhet të ketë të paktën 3 karaktere.' }),
  type: z.enum(['website description', 'blog post', 'SEO content']),
  keywords: z.string().optional(),
  tone: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ContentGeneratorSection() {
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      type: 'blog post',
      keywords: '',
      tone: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setGeneratedContent('');
    const result = await handleContentGeneration(values);
    setIsLoading(false);

    if (result.success && result.content) {
      setGeneratedContent(result.content);
      toast({
        title: 'Sukses!',
        description: 'Përmbajtja u gjenerua me sukses.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Gabim!',
        description: result.error || 'Ndodhi një gabim i papritur.',
      });
    }
  }

  return (
    <section id="content-generator" className="bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Gjenerator Përmbajtjeje AI</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Provoni fuqinë e AI për të krijuar përmbajtje marketingu tërheqëse dhe efektive në sekonda.
            </p>
          </div>
        </div>
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline">Krijoni Përmbajtjen Tuaj</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="topic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tema</FormLabel>
                          <FormControl>
                            <Input placeholder="p.sh. Marketimi dixhital për hotelet" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipi i Përmbajtjes</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Zgjidhni tipin" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="website description">Përshkrim Faqeje</SelectItem>
                              <SelectItem value="blog post">Postim Blogu</SelectItem>
                              <SelectItem value="SEO content">Përmbajtje SEO</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="keywords"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fjalë Kyçe (opsionale)</FormLabel>
                          <FormControl>
                            <Input placeholder="p.sh. turizëm, rezervime, verë" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="tone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Toni (opsional)</FormLabel>
                          <FormControl>
                            <Input placeholder="p.sh. Profesional, Miqësor, Argëtues" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isLoading ? 'Duke Gjeneruar...' : 'Gjenero Përmbajtje'}
                    </Button>
                  </form>
                </div>
                <div className="flex flex-col">
                  <FormItem>
                    <FormLabel>Përmbajtja e Gjeneruar</FormLabel>
                    <FormControl>
                      <Textarea
                        readOnly
                        value={generatedContent}
                        placeholder="Këtu do të shfaqet përmbajtja e gjeneruar nga AI..."
                        className="flex-grow mt-2 min-h-[250px] resize-none"
                      />
                    </FormControl>
                  </FormItem>
                </div>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
