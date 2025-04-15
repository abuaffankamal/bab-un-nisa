import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpenIcon, SearchIcon, BookIcon } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Types
interface HadithBook {
  id: string;
  name: string;
  hasChapters: boolean;
  totalHadith: number;
}

interface HadithChapter {
  id: number;
  chapterNumber: number;
  bookId: string;
  title: string;
  hadithStartNumber: number;
  hadithEndNumber: number;
}

interface Hadith {
  id: number;
  collection: string;
  bookNumber: number;
  chapterNumber: number;
  hadithNumber: number;
  textArabic: string;
  translations: {
    english: string;
    urdu: string;
    hindi: string;
  };
  grades: { grade: string; graded_by: string }[];
}

// Mock hadith books data until API is implemented
const mockHadithBooks: HadithBook[] = [
  { id: 'bukhari', name: 'Sahih al-Bukhari', hasChapters: true, totalHadith: 7563 },
  { id: 'muslim', name: 'Sahih Muslim', hasChapters: true, totalHadith: 7563 },
  { id: 'nasai', name: 'Sunan an-Nasa\'i', hasChapters: true, totalHadith: 5761 },
  { id: 'abudawud', name: 'Sunan Abi Dawud', hasChapters: true, totalHadith: 5274 },
  { id: 'tirmidhi', name: 'Jami\' at-Tirmidhi', hasChapters: true, totalHadith: 3956 },
  { id: 'ibnmajah', name: 'Sunan Ibn Majah', hasChapters: true, totalHadith: 4341 },
  { id: 'malik', name: 'Muwatta Malik', hasChapters: true, totalHadith: 1851 },
  { id: 'riyadussalihin', name: 'Riyad as-Salihin', hasChapters: true, totalHadith: 1906 },
  { id: 'nawawi40', name: 'Nawawi 40', hasChapters: false, totalHadith: 42 }
];

export default function Hadith() {
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>('browse');
  type TranslationLanguage = 'english' | 'urdu' | 'hindi';
  const [selectedLanguage, setSelectedLanguage] = useState<TranslationLanguage>('english');
  
  // Helper function to handle language change with type safety
  const handleLanguageChange = (value: string) => {
    if (value === 'english' || value === 'urdu' || value === 'hindi') {
      setSelectedLanguage(value);
    }
  };
  const { toast } = useToast();
  const itemsPerPage = 10;

  // Fetch hadith books
  const { data: books, isLoading: isBooksLoading } = useQuery({
    queryKey: ['hadithBooks'],
    queryFn: async () => {
      // In a real app, we would fetch from API
      // const response = await apiRequest('/api/hadith/books');
      // return response;
      
      // Using mock data for now
      return mockHadithBooks;
    }
  });

  // Fetch chapters for selected book
  const { data: chapters, isLoading: isChaptersLoading } = useQuery({
    queryKey: ['hadithChapters', selectedBook],
    queryFn: async () => {
      if (!selectedBook) return [];
      
      // In a real app, we would fetch from API
      // const response = await apiRequest(`/api/hadith/chapters/${selectedBook}`);
      // return response;
      
      // Mock chapter data
      return Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        chapterNumber: i + 1,
        bookId: selectedBook,
        title: `Chapter ${i + 1}`,
        hadithStartNumber: i * 10 + 1,
        hadithEndNumber: (i + 1) * 10
      }));
    },
    enabled: !!selectedBook
  });

  // Fetch hadiths based on selected filters
  const { data: hadiths, isLoading: isHadithsLoading } = useQuery({
    queryKey: ['hadiths', selectedBook, selectedChapter, currentPage],
    queryFn: async () => {
      if (!selectedBook) return [];
      
      // In a real app, we would fetch from API
      // const response = await apiRequest(`/api/hadith/${selectedBook}?chapter=${selectedChapter}&page=${currentPage}&limit=${itemsPerPage}`);
      // return response;
      
      // Mock hadith data with Arabic text and multiple translations
      return Array.from({ length: itemsPerPage }, (_, i) => {
        const hadithNumber = i + 1 + (currentPage - 1) * itemsPerPage;
        return {
          id: hadithNumber,
          collection: selectedBook,
          bookNumber: 1,
          chapterNumber: selectedChapter || 1,
          hadithNumber: hadithNumber,
          textArabic: getArabicText(selectedBook, hadithNumber),
          translations: getHadithTranslations(hadithNumber, selectedBook, selectedChapter),
          grades: [{ grade: 'Sahih', graded_by: 'Al-Bukhari' }]
        };
      });
    },
    enabled: !!selectedBook
  });
  
  // Helper function to get translations for hadith based on the number
  function getHadithTranslations(hadithNumber: number, collection?: string, chapter?: number | null) {
    // Return translations based on the hadith number
    switch (hadithNumber % 5) {
      case 0:
        return {
          english: "The Messenger of Allah (ﷺ) said: 'Actions are judged by their intentions, and everyone will be rewarded according to their intentions. Whoever migrates for the sake of Allah and His Messenger, then his migration will be for Allah and His Messenger. And whoever migrates for worldly gain or to marry a woman, then his migration will be for what he migrated for.'",
          urdu: "رسول اللہ (ﷺ) نے فرمایا: 'اعمال کا دارومدار نیتوں پر ہے، اور ہر شخص کو اس کی نیت کے مطابق اجر ملے گا۔ جس کی ہجرت اللہ اور اس کے رسول کی خاطر ہو، تو اس کی ہجرت اللہ اور اس کے رسول کی طرف ہے۔ اور جس کی ہجرت دنیا کمانے یا کسی عورت سے شادی کرنے کی خاطر ہو، تو اس کی ہجرت اسی چیز کی طرف ہے جس کی طرف اس نے ہجرت کی۔'",
          hindi: "अल्लाह के रसूल (ﷺ) ने कहा: 'कार्य उनके इरादों से निर्धारित होते हैं, और हर व्यक्ति को उसके इरादे के अनुसार पुरस्कार मिलेगा। जो अल्लाह और उसके रसूल की खातिर हिजरत करता है, तो उसकी हिजरत अल्लाह और उसके रसूल के लिए होगी। और जो दुनिया कमाने या किसी स्त्री से शादी करने के लिए हिजरत करता है, तो उसकी हिजरत उसी चीज़ के लिए होगी जिसके लिए उसने हिजरत की।'"
        };
      case 1:
        return {
          english: "The Prophet (ﷺ) said: 'A Muslim is the one from whose tongue and hands other Muslims are safe, and a Muhajir (emigrant) is the one who abandons what Allah has forbidden.'",
          urdu: "نبی (ﷺ) نے فرمایا: 'مسلمان وہ ہے جس کی زبان اور ہاتھ سے دوسرے مسلمان محفوظ رہیں، اور مہاجر وہ ہے جو اللہ کی منع کردہ چیزوں کو چھوڑ دے۔'",
          hindi: "नबी (ﷺ) ने कहा: 'मुसलमान वह है जिसकी जीभ और हाथों से दूसरे मुसलमान सुरक्षित रहें, और मुहाजिर (प्रवासी) वह है जो अल्लाह द्वारा मना की गई चीज़ों को छोड़ दे।'"
        };
      case 2:
        return {
          english: "The Prophet (ﷺ) said: 'None of you truly believes until he loves for his brother what he loves for himself.'",
          urdu: "نبی (ﷺ) نے فرمایا: 'تم میں سے کوئی اس وقت تک مومن نہیں ہو سکتا جب تک کہ وہ اپنے بھائی کے لیے وہی پسند نہ کرے جو اپنے لیے پسند کرتا ہے۔'",
          hindi: "नबी (ﷺ) ने कहा: 'तुम में से कोई व्यक्ति उस समय तक मोमिन नहीं हो सकता जब तक वह अपने भाई के लिए वही न चाहे जो अपने लिए चाहता है।'"
        };
      case 3:
        return {
          english: "The Messenger of Allah (ﷺ) said: 'Whoever believes in Allah and the Last Day, let him speak good or remain silent. Whoever believes in Allah and the Last Day, let him be generous to his neighbor. Whoever believes in Allah and the Last Day, let him be generous to his guest.'",
          urdu: "رسول اللہ (ﷺ) نے فرمایا: 'جو اللہ اور آخرت کے دن پر ایمان رکھتا ہے، وہ اچھی بات کہے یا خاموش رہے۔ جو اللہ اور آخرت کے دن پر ایمان رکھتا ہے، وہ اپنے پڑوسی کے ساتھ اچھا سلوک کرے۔ جو اللہ اور آخرت کے دن پر ایمان رکھتا ہے، وہ اپنے مہمان کی عزت کرے۔'",
          hindi: "अल्लाह के रसूल (ﷺ) ने कहा: 'जो अल्लाह और आखिरत के दिन पर ईमान रखता है, वह अच्छी बात कहे या चुप रहे। जो अल्लाह और आखिरत के दिन पर ईमान रखता है, वह अपने पड़ोसी के साथ अच्छा व्यवहार करे। जो अल्लाह और आखिरत के दिन पर ईमान रखता है, वह अपने मेहमान का सम्मान करे।'"
        };
      case 4:
        return {
          english: "The Prophet (ﷺ) said: 'Islam is built upon five pillars: testifying that there is no god worthy of worship except Allah and that Muhammad is the Messenger of Allah, establishing prayer, giving zakah, making pilgrimage to the House, and fasting in Ramadan.'",
          urdu: "نبی (ﷺ) نے فرمایا: 'اسلام پانچ چیزوں پر قائم ہے: اس بات کی گواہی دینا کہ اللہ کے سوا کوئی معبود نہیں اور محمد اللہ کے رسول ہیں، نماز قائم کرنا، زکاۃ دینا، حج کرنا، اور رمضان کے روزے رکھنا۔'",
          hindi: "नबी (ﷺ) ने कहा: 'इस्लाम पांच स्तंभों पर आधारित है: इस बात की गवाही देना कि अल्लाह के अलावा कोई पूजा के योग्य नहीं है और मुहम्मद अल्लाह के रसूल हैं, नमाज़ स्थापित करना, ज़कात देना, हज करना, और रमज़ान के रोज़े रखना।'"
        };
      default:
        return {
          english: `This is the English translation of hadith #${hadithNumber} from ${collection || 'collection'}, chapter ${chapter || 'all'}. In a real application, this would contain the actual English translation from an authentic API source.`,
          urdu: `یہ ${collection || 'کلیکشن'} سے حدیث نمبر ${hadithNumber} کا اردو ترجمہ ہے، باب ${chapter || 'تمام'}۔ حقیقی ایپلیکیشن میں، یہ ایک مستند اے پی آئی سورس سے اصل اردو ترجمہ پر مشتمل ہوگا۔`,
          hindi: `यह ${collection || 'संग्रह'} से हदीस नंबर ${hadithNumber} का हिंदी अनुवाद है, अध्याय ${chapter || 'सभी'}। वास्तविक एप्लिकेशन में, यह एक प्रामाणिक API स्रोत से वास्तविक हिंदी अनुवाद होगा।`
        };
    }
  }
  
  // Helper function to get Arabic text for a hadith
  function getArabicText(collection: string, hadithNumber: number): string {
    // In a real app, this would be fetched from an API
    // First part is the chain of narration (isnad)
    const isnad = `حَدَّثَنَا عَبْدُ اللَّهِ بْنُ مُحَمَّدٍ، قَالَ: حَدَّثَنَا عَبْدُ الرَّزَّاقِ، قَالَ: أَخْبَرَنَا مَعْمَرٌ، عَنْ هَمَّامِ بْنِ مُنَبِّهٍ، قَالَ: هَذَا مَا حَدَّثَنَا أَبُو هُرَيْرَةَ، عَنْ رَسُولِ اللَّهِ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ`;
    
    // Sample hadith texts based on number
    let matn = '';
    
    // Add some sample actual hadith content (matn)
    switch(hadithNumber % 5) {
      case 0:
        matn = `قَالَ رَسُولُ اللَّهِ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى دُنْيَا يُصِيبُهَا أَوْ إِلَى امْرَأَةٍ يَنْكِحُهَا، فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ."`;
        break;
      case 1:
        matn = `قَالَ النَّبِيُّ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ، وَالْمُهَاجِرُ مَنْ هَجَرَ مَا نَهَى اللَّهُ عَنْهُ."`;
        break;
      case 2:
        matn = `قَالَ النَّبِيُّ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ."`;
        break;
      case 3:
        matn = `قَالَ رَسُولُ اللَّهِ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيُكْرِمْ جَارَهُ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيُكْرِمْ ضَيْفَهُ."`;
        break;
      case 4:
        matn = `قَالَ النَّبِيُّ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ: "بُنِيَ الْإِسْلَامُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لَا إِلَهَ إِلَّا اللَّهُ، وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلَاةِ، وَإِيتَاءِ الزَّكَاةِ، وَالْحَجِّ، وَصَوْمِ رَمَضَانَ."`;
        break;
    }
    
    return `${isnad} ${matn}\n\n${collection} - ${hadithNumber}`;
  }

  // Fetch search results
  const { data: searchResults, isLoading: isSearchLoading } = useQuery({
    queryKey: ['hadithSearch', searchQuery, currentPage],
    queryFn: async () => {
      if (!searchQuery) return [];
      
      // In a real app, we would fetch from API
      // const response = await apiRequest(`/api/hadith/search?q=${searchQuery}&page=${currentPage}&limit=${itemsPerPage}`);
      // return response;
      
      // Mock search results with Arabic text and translations
      return Array.from({ length: 5 }, (_, i) => {
        const hadithNumber = i + 1;
        return {
          id: hadithNumber,
          collection: 'bukhari',
          bookNumber: 1,
          chapterNumber: 1,
          hadithNumber: hadithNumber,
          textArabic: getArabicText('bukhari', hadithNumber),
          translations: getHadithTranslations(hadithNumber),
          grades: [{ grade: 'Sahih', graded_by: 'Al-Bukhari' }]
        };
      });
    },
    enabled: searchQuery.length > 2 && activeTab === 'search'
  });

  const handleSearch = () => {
    if (searchQuery.length < 3) {
      toast({
        title: 'Search query too short',
        description: 'Please enter at least 3 characters to search',
        variant: 'destructive'
      });
      return;
    }
    setCurrentPage(1);
  };

  const handleBookChange = (value: string) => {
    setSelectedBook(value);
    setSelectedChapter(null);
    setCurrentPage(1);
  };

  const handleChapterChange = (value: string) => {
    // If value is "0", it means "All chapters" is selected
    setSelectedChapter(value === "0" ? null : parseInt(value));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Calculate total pages
  const totalPages = 10; // In a real app, this would come from the API response

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Hadith Collections</h1>
      
      <Tabs defaultValue="browse" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
          <TabsTrigger value="browse">Browse Collections</TabsTrigger>
          <TabsTrigger value="search">Search Hadith</TabsTrigger>
        </TabsList>
        
        <TabsContent value="browse" className="mt-6">
          <div className="flex flex-col space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Browse Hadith Collections</CardTitle>
                <CardDescription>
                  Explore authentic hadith from major collections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Collection</label>
                  <Select value={selectedBook} onValueChange={handleBookChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a hadith collection" />
                    </SelectTrigger>
                    <SelectContent>
                      {isBooksLoading ? (
                        <div className="p-2">
                          <Skeleton className="h-5 w-full mb-2" />
                          <Skeleton className="h-5 w-full mb-2" />
                          <Skeleton className="h-5 w-full" />
                        </div>
                      ) : (
                        books?.map(book => (
                          <SelectItem key={book.id} value={book.id}>{book.name}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedBook && books?.find(b => b.id === selectedBook)?.hasChapters && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Chapter</label>
                    <Select value={selectedChapter?.toString() || '0'} onValueChange={handleChapterChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="All chapters" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">All chapters</SelectItem>
                        {isChaptersLoading ? (
                          <div className="p-2">
                            <Skeleton className="h-5 w-full mb-2" />
                            <Skeleton className="h-5 w-full mb-2" />
                            <Skeleton className="h-5 w-full" />
                          </div>
                        ) : (
                          chapters?.map(chapter => (
                            <SelectItem key={chapter.id} value={chapter.chapterNumber.toString()}>
                              {chapter.title}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {selectedBook && (
              <>
                <div className="space-y-4">
                  {isHadithsLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent>
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-3/4" />
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    hadiths?.map(hadith => (
                      <Card key={hadith.id} className="overflow-hidden">
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">Hadith #{hadith.hadithNumber}</CardTitle>
                            <div className="text-sm text-gray-500">
                              Grade: {hadith.grades[0]?.grade || 'Not specified'}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="bg-primary-50 p-4 rounded-md">
                            <p className="text-xl text-right leading-loose font-arabic" dir="rtl">{hadith.textArabic}</p>
                          </div>
                          
                          <div>
                            <p className={`text-gray-700 ${selectedLanguage === 'urdu' ? 'font-urdu' : ''}`}>
                              {hadith.translations[selectedLanguage]}
                            </p>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center border-t">
                          <div className="text-sm text-gray-500">
                            {books?.find(b => b.id === hadith.collection)?.name || hadith.collection}, Book {hadith.bookNumber}, Chapter {hadith.chapterNumber}
                          </div>
                          <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="english">English</SelectItem>
                              <SelectItem value="urdu">Urdu</SelectItem>
                              <SelectItem value="hindi">Hindi</SelectItem>
                            </SelectContent>
                          </Select>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </div>
                
                <div className="flex justify-center mt-6">
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="search" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Hadith</CardTitle>
              <CardDescription>
                Search for hadith by keywords
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    placeholder="Enter keywords to search hadith..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button onClick={handleSearch} disabled={searchQuery.length < 3 || isSearchLoading}>
                  <SearchIcon className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
              
              {searchQuery.length > 0 && (
                <div className="mt-6 space-y-4">
                  {isSearchLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent>
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-3/4" />
                        </CardContent>
                      </Card>
                    ))
                  ) : searchResults?.length ? (
                    searchResults.map(hadith => (
                      <Card key={hadith.id} className="overflow-hidden">
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">Hadith #{hadith.hadithNumber}</CardTitle>
                            <div className="text-sm text-gray-500">
                              Grade: {hadith.grades[0]?.grade || 'Not specified'}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="bg-primary-50 p-4 rounded-md">
                            <p className="text-xl text-right leading-loose font-arabic" dir="rtl">{hadith.textArabic}</p>
                          </div>
                          
                          <div>
                            <p className={`text-gray-700 ${selectedLanguage === 'urdu' ? 'font-urdu' : ''}`}>
                              {hadith.translations[selectedLanguage]}
                            </p>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center border-t">
                          <div className="text-sm text-gray-500">
                            {books?.find(b => b.id === hadith.collection)?.name || hadith.collection}, Book {hadith.bookNumber}, Chapter {hadith.chapterNumber}
                          </div>
                          <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="english">English</SelectItem>
                              <SelectItem value="urdu">Urdu</SelectItem>
                              <SelectItem value="hindi">Hindi</SelectItem>
                            </SelectContent>
                          </Select>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <SearchIcon className="h-10 w-10 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium">No results found</h3>
                      <p className="text-gray-500 mt-2">Try different search terms or browse collections instead.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}