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
          translations: {
            english: `This is the English translation of hadith #${hadithNumber} from ${selectedBook}, chapter ${selectedChapter || 'all'}. In a real application, this would contain the actual English translation from an authentic API source.`,
            urdu: `یہ ${selectedBook} سے حدیث نمبر ${hadithNumber} کا اردو ترجمہ ہے، باب ${selectedChapter || 'تمام'}۔ حقیقی ایپلیکیشن میں، یہ ایک مستند اے پی آئی سورس سے اصل اردو ترجمہ پر مشتمل ہوگا۔`,
            hindi: `यह ${selectedBook} से हदीस नंबर ${hadithNumber} का हिंदी अनुवाद है, अध्याय ${selectedChapter || 'सभी'}। वास्तविक एप्लिकेशन में, यह एक प्रामाणिक API स्रोत से वास्तविक हिंदी अनुवाद होगा।`
          },
          grades: [{ grade: 'Sahih', graded_by: 'Al-Bukhari' }]
        };
      });
    },
    enabled: !!selectedBook
  });
  
  // Helper function to get Arabic text for a hadith
  function getArabicText(collection: string, hadithNumber: number): string {
    // In a real app, this would be fetched from an API
    return `حَدَّثَنَا عَبْدُ اللَّهِ بْنُ مُحَمَّدٍ، قَالَ: حَدَّثَنَا عَبْدُ الرَّزَّاقِ، قَالَ: أَخْبَرَنَا مَعْمَرٌ، عَنْ هَمَّامِ بْنِ مُنَبِّهٍ، قَالَ: هَذَا مَا حَدَّثَنَا أَبُو هُرَيْرَةَ، عَنْ رَسُولِ اللَّهِ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ فَذَكَرَ أَحَادِيثَ مِنْهَا ${collection} - ${hadithNumber}`;
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
          translations: {
            english: `This is a sample search result for query "${searchQuery}" (Hadith #${hadithNumber}). In a real application, this would contain matching hadith text in English.`,
            urdu: `یہ "${searchQuery}" کیلئے تلاش کا نتیجہ ہے (حدیث نمبر ${hadithNumber})۔ حقیقی ایپلیکیشن میں، یہاں حدیث کا مطابقت کرنے والا متن اردو میں ہوگا۔`,
            hindi: `यह "${searchQuery}" के लिए खोज परिणाम है (हदीस नंबर ${hadithNumber})। वास्तविक एप्लिकेशन में, यहां हिंदी में हदीस का मिलान करने वाला पाठ होगा।`
          },
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
                            <p className="text-gray-700">{hadith.translations[selectedLanguage]}</p>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center border-t">
                          <div className="text-sm text-gray-500">
                            {books?.find(b => b.id === hadith.collection)?.name || hadith.collection}, Book {hadith.bookNumber}, Chapter {hadith.chapterNumber}
                          </div>
                          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
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
                            <p className="text-gray-700">{hadith.translations[selectedLanguage]}</p>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center border-t">
                          <div className="text-sm text-gray-500">
                            {books?.find(b => b.id === hadith.collection)?.name || hadith.collection}, Book {hadith.bookNumber}, Chapter {hadith.chapterNumber}
                          </div>
                          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
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
                  ) : searchQuery.length >= 3 ? (
                    <div className="text-center py-8">
                      <BookOpenIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium">No results found</h3>
                      <p className="text-gray-500">Try different keywords or spellings</p>
                    </div>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 bg-primary-50 border border-primary-200 rounded-lg p-4">
        <div className="flex items-start">
          <BookIcon className="h-5 w-5 text-primary-700 mt-1 mr-3" />
          <div>
            <h3 className="font-medium text-primary-900">About Hadith Collections</h3>
            <p className="text-sm text-gray-600 mt-1">
              Hadith are the collected sayings, actions, and silent approvals of Prophet Muhammad (peace be upon him). 
              They are a crucial source of Islamic guidance alongside the Quran. The most authentic collections are 
              Sahih al-Bukhari and Sahih Muslim, followed by the Four Sunan (Abu Dawud, Tirmidhi, Nasa'i, and Ibn Majah).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}