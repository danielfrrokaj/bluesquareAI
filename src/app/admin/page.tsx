
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, DocumentData, CollectionReference } from 'firebase/firestore';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase/provider';
import { ChatHistoryDialog } from '@/components/chat-history-dialog';

type ChatMessage = {
    role: 'user' | 'assistant';
    content: string;
};

interface ContactFormSubmission {
    id: string;
    phoneNumber: string;
    interestedServices: ChatMessage[];
    submissionDate: string;
    preferredLanguage: 'en' | 'sq';
}

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const auth = useAuth();
  const [selectedSubmission, setSelectedSubmission] = useState<ContactFormSubmission | null>(null);

  const submissionsRef = useMemoFirebase(() => {
    // Wait until we have a user and firestore instance
    if (!firestore || !user) return null;
    return collection(firestore, 'contactFormSubmissions') as CollectionReference<DocumentData>;
  }, [firestore, user]);

  const submissionsQuery = useMemoFirebase(() => {
    if (!submissionsRef) return null;
    return query(submissionsRef, orderBy('submissionDate', 'desc'));
  }, [submissionsRef]);

  const { data: submissions, isLoading: isSubmissionsLoading, error } = useCollection<ContactFormSubmission>(submissionsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/admin/login');
  };
  
  const getContextPreview = (messages: ChatMessage[]) => {
      const lastUserMessage = messages.slice().reverse().find(m => m.role === 'user');
      return lastUserMessage?.content || 'No user messages found.';
  }

  return (
    <>
      <div className="flex flex-col min-h-screen bg-background">
        <Header lang="en" />
        <main className="flex-1 py-12">
          <div className="container">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
              <Button onClick={handleLogout} variant="outline">Logout</Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Contact Form Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                {isSubmissionsLoading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
                {error && <p className="text-destructive">Error loading submissions: {error.message}</p>}
                {!isSubmissionsLoading && submissions && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Phone Number</TableHead>
                        <TableHead>Language</TableHead>
                        <TableHead>Context</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission) => (
                        <TableRow key={submission.id} >
                          <TableCell>{new Date(submission.submissionDate).toLocaleString()}</TableCell>
                          <TableCell>{submission.phoneNumber}</TableCell>
                          <TableCell>
                            <Badge variant={submission.preferredLanguage === 'en' ? 'default' : 'secondary'}>
                              {submission.preferredLanguage.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell 
                            className="text-xs text-muted-foreground max-w-md truncate cursor-pointer hover:text-primary"
                            onClick={() => setSelectedSubmission(submission)}
                          >
                              {getContextPreview(submission.interestedServices)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                 {!isSubmissionsLoading && submissions?.length === 0 && (
                   <p className="text-center text-muted-foreground py-8">No submissions yet.</p>
                  )}
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer lang="en" />
      </div>
      {selectedSubmission && (
        <ChatHistoryDialog
            submission={selectedSubmission}
            isOpen={!!selectedSubmission}
            onClose={() => setSelectedSubmission(null)}
        />
      )}
    </>
  );
}
