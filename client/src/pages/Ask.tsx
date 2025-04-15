import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { askChatGPT } from '@/services/openaiService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { InfoIcon, SendIcon, UserIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkRehype from 'remark-rehype';
import rehypeAddClasses from 'rehype-add-classes';

export default function Ask() {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('ask');
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!question.trim()) {
      toast({
        title: 'Please enter a question',
        description: 'Your question cannot be empty',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await askChatGPT(question);
      setResponse(result.answer);
      setQuestion('');
    } catch (err) {
      console.error('Error asking question:', err);
      setError('An error occurred while processing your question. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sample FAQ questions
  const faqQuestions = [
    {
      question: 'What are the five pillars of Islam?',
      answer: `The five pillars of Islam are the core beliefs and practices that Muslims follow:
      
1. Shahada (Faith): Declaring belief in one God (Allah) and that Muhammad is God's messenger.
2. Salat (Prayer): Performing ritual prayers five times each day.
3. Zakat (Charity): Giving a portion of one's wealth to those in need.
4. Sawm (Fasting): Abstaining from food and drink from dawn to sunset during Ramadan.
5. Hajj (Pilgrimage): Making a pilgrimage to Mecca at least once in one's lifetime if able.

These five pillars form the foundation of Muslim life and are considered obligatory for all believers.`
    },
    {
      question: 'What is the difference between Sunni and Shia Muslims?',
      answer: `Sunni and Shia are the two major denominations of Islam that formed after the death of Prophet Muhammad over the issue of succession.

Sunni Muslims:
- Believe that Abu Bakr, the Prophet's companion, was the rightful successor
- Make up about 85-90% of Muslims worldwide
- Follow the four schools of Islamic jurisprudence (Hanafi, Maliki, Shafi'i, Hanbali)
- Emphasize consensus of the Muslim community and Sunnah (practices of the Prophet)

Shia Muslims:
- Believe that Ali ibn Abi Talib, the Prophet's cousin and son-in-law, was the rightful successor
- Make up about 10-15% of Muslims worldwide
- Place special importance on the Imams (descendants of Ali) as religious leaders
- Developed their own schools of jurisprudence (mainly Ja'fari)

Despite these differences, both groups share the core beliefs of Islam including the Five Pillars, belief in the Quran as the holy book, and Muhammad as the final prophet.`
    },
    {
      question: 'How do I perform Wudu (ablution)?',
      answer: `Wudu (ablution) is the Islamic procedure for cleansing parts of the body before prayer or handling the Quran. Here's how to perform Wudu:

1. Make the intention (niyyah) to perform Wudu
2. Say "Bismillah" (In the name of Allah)
3. Wash both hands up to the wrists three times
4. Rinse your mouth three times
5. Clean your nose by sniffing water and blowing it out three times
6. Wash your face three times from forehead to chin and ear to ear
7. Wash your right arm to the elbow three times, then left arm three times
8. Wipe your head with wet hands from front to back once
9. Wipe the inside and outside of your ears with wet fingers once
10. Wash your right foot to the ankle three times, then left foot three times

After completing Wudu, many Muslims recite the shahada: "Ash-hadu an la ilaha illa Allah, wa ash-hadu anna Muhammadan rasul Allah" (I bear witness that there is no deity but Allah, and I bear witness that Muhammad is the messenger of Allah).

Wudu is invalidated by using the toilet, passing gas, deep sleep, or bleeding.`
    }
  ];

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Ask a Question</h1>
      
      <Tabs defaultValue="ask" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
          <TabsTrigger value="ask">Ask a Question</TabsTrigger>
          <TabsTrigger value="faq">Common Questions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ask" className="mt-6">
          <div className="flex flex-col space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ask an Islamic Question</CardTitle>
                <CardDescription>
                  Get answers to your questions about Islam from reliable sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Type your question here..."
                  className="min-h-[150px]"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
                
                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-gray-500 flex items-center">
                  <InfoIcon className="h-4 w-4 mr-1" />
                  We use Artificial Intelligence to provide accurate answers
                </div>
                <Button onClick={handleSubmit} disabled={isLoading || !question.trim()}>
                  {isLoading ? (
                    <>
                      <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <SendIcon className="h-4 w-4 mr-2" />
                      Submit
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            {response && (
              <Card>
                <CardHeader>
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src="/assets/ai-avatar.png" alt="AI" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <CardTitle>Answer</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-700">
                    <ReactMarkdown
                      remarkPlugins={[remarkRehype]}
                      rehypePlugins={[[rehypeAddClasses, { "div": "markdown-body" }]]}
                    >
                      {response}
                    </ReactMarkdown>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="text-xs text-gray-500">
                    Note: This answer was generated using AI and should be verified with Islamic scholars for important religious matters.
                  </div>
                </CardFooter>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="faq" className="mt-6">
          <div className="flex flex-col space-y-6">
            {faqQuestions.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2 bg-primary-100">
                      <AvatarFallback>
                        <UserIcon className="h-4 w-4 text-primary-700" />
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-line text-gray-700">
                    {faq.answer}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
