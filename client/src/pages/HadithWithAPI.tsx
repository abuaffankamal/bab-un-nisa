import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import {
  HadithBook,
  HadithChapter,
  Hadith as HadithType,
  getHadithCollections,
  getHadithBooks,
  getHadithChapters,
  getHadiths,
  searchHadiths,
  generateMockTranslations
} from "@/services/hadithService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define types for Hadith data
type TranslationLanguage = 'english' | 'urdu' | 'hindi';

export default function Hadith() {
  const { toast } = useToast();
  
  // State for collections, books, chapters, and hadiths
  const [collections, setCollections] = useState<HadithBook[]>([]);
  const [books, setBooks] = useState<HadithBook[]>([]);
  const [chapters, setChapters] = useState<HadithChapter[]>([]);
  const [hadiths, setHadiths] = useState<HadithType[]>([]);
  
  // State for selections
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalHadiths, setTotalHadiths] = useState<number>(0);
  const [perPage] = useState<number>(5);
  
  // State for loading indicators
  const [isLoadingCollections, setIsLoadingCollections] = useState<boolean>(true);
  const [isLoadingBooks, setIsLoadingBooks] = useState<boolean>(false);
  const [isLoadingChapters, setIsLoadingChapters] = useState<boolean>(false);
  const [isLoadingHadiths, setIsLoadingHadiths] = useState<boolean>(false);
  
  // State for search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  
  // State for language selection
  const [translationLanguage, setTranslationLanguage] = useState<TranslationLanguage>('english');

  // Fetch collections on component mount
  useEffect(() => {
    async function fetchCollections() {
      try {
        const data = await getHadithCollections();
        setCollections(data);
        if (data.length > 0) {
          setSelectedCollection(data[0].collection);
        }
      } catch (error) {
        console.error("Error fetching collections:", error);
        toast({
          title: "Error",
          description: "Failed to load Hadith collections. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingCollections(false);
      }
    }
    
    fetchCollections();
  }, [toast]);

  // Fetch books when collection changes
  useEffect(() => {
    if (!selectedCollection) return;
    
    async function fetchBooks() {
      setIsLoadingBooks(true);
      try {
        const data = await getHadithBooks(selectedCollection);
        setBooks(data);
        if (data.length > 0) {
          setSelectedBook(data[0].bookNumber);
        } else {
          setSelectedBook("");
        }
        // Reset chapter selection
        setSelectedChapter(null);
      } catch (error) {
        console.error(`Error fetching books for ${selectedCollection}:`, error);
        toast({
          title: "Error",
          description: "Failed to load Hadith books. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingBooks(false);
      }
    }
    
    fetchBooks();
  }, [selectedCollection, toast]);

  // Fetch chapters when book changes
  useEffect(() => {
    if (!selectedCollection || !selectedBook) return;
    
    async function fetchChapters() {
      setIsLoadingChapters(true);
      try {
        const data = await getHadithChapters(selectedCollection, selectedBook);
        setChapters(data);
        if (data.length > 0) {
          setSelectedChapter(data[0].chapterNumber);
        } else {
          setSelectedChapter(null);
        }
      } catch (error) {
        console.error(`Error fetching chapters for ${selectedCollection}, Book ${selectedBook}:`, error);
        toast({
          title: "Error",
          description: "Failed to load Hadith chapters. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingChapters(false);
      }
    }
    
    fetchChapters();
  }, [selectedCollection, selectedBook, toast]);

  // Fetch hadiths based on current selections and pagination
  const fetchHadiths = useCallback(async () => {
    if (!selectedCollection || !selectedBook) return;
    
    setIsLoadingHadiths(true);
    try {
      const result = await getHadiths(
        selectedCollection,
        selectedBook,
        selectedChapter || undefined,
        currentPage,
        perPage
      );
      
      // Add mock translations for Urdu and Hindi
      const hadithsWithTranslations = result.hadiths.map(hadith => generateMockTranslations(hadith));
      
      setHadiths(hadithsWithTranslations);
      setTotalHadiths(result.total);
    } catch (error) {
      console.error("Error fetching hadiths:", error);
      toast({
        title: "Error",
        description: "Failed to load Hadiths. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingHadiths(false);
    }
  }, [selectedCollection, selectedBook, selectedChapter, currentPage, perPage, toast]);

  // Fetch hadiths when selections or pagination changes
  useEffect(() => {
    if (isSearching) return;
    fetchHadiths();
  }, [fetchHadiths, isSearching]);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setIsSearching(false);
      fetchHadiths();
      return;
    }
    
    setIsSearching(true);
    setIsLoadingHadiths(true);
    
    try {
      const result = await searchHadiths(searchQuery, currentPage, perPage);
      
      // Add mock translations for Urdu and Hindi
      const hadithsWithTranslations = result.hadiths.map(hadith => generateMockTranslations(hadith));
      
      setHadiths(hadithsWithTranslations);
      setTotalHadiths(result.total);
    } catch (error) {
      console.error(`Error searching for "${searchQuery}":`, error);
      toast({
        title: "Error",
        description: "Search failed. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingHadiths(false);
    }
  };

  // Handle pagination
  const totalPages = Math.ceil(totalHadiths / perPage);
  
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
    setCurrentPage(1);
  };

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    // Calculate visible page numbers
    const pageNumbers: number[] = [];
    
    if (totalPages <= 5) {
      // Show all pages if 5 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Show ellipsis or pages
      if (currentPage > 3) {
        pageNumbers.push(-1); // -1 represents ellipsis
      }
      
      // Show current page and neighbors
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Show ellipsis or pages
      if (currentPage < totalPages - 2) {
        pageNumbers.push(-2); // -2 represents ellipsis
      }
      
      // Always show last page
      pageNumbers.push(totalPages);
    }
    
    return (
      <div className="flex justify-center items-center gap-2 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        
        {pageNumbers.map((pageNumber, index) => {
          if (pageNumber < 0) {
            // Render ellipsis
            return <span key={`ellipsis-${index}`}>...</span>;
          }
          
          return (
            <Button
              key={pageNumber}
              variant={pageNumber === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => goToPage(pageNumber)}
            >
              {pageNumber}
            </Button>
          );
        })}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    );
  };

  // Skeleton loading component for hadiths
  const renderHadithSkeletons = () => {
    return Array.from({ length: perPage }).map((_, index) => (
      <Card key={index} className="mb-4">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full mb-2" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    ));
  };

  // Translation language is handled inline in the Select component

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Hadith Collections</h1>
      
      {/* Search bar */}
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Search hadith..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={isLoadingHadiths}>
          Search
        </Button>
        {isSearching && (
          <Button variant="outline" onClick={clearSearch}>
            Clear
          </Button>
        )}
      </div>
      
      {isSearching ? (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing search results for "{searchQuery}"
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Collection selection */}
          <div>
            <label className="text-sm font-medium mb-1 block">Collection</label>
            {isLoadingCollections ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={selectedCollection}
                onValueChange={setSelectedCollection}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select collection" />
                </SelectTrigger>
                <SelectContent>
                  {collections.map((collection) => (
                    <SelectItem key={collection.collection} value={collection.collection}>
                      {collection.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Book selection */}
          <div>
            <label className="text-sm font-medium mb-1 block">Book</label>
            {isLoadingBooks ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={selectedBook}
                onValueChange={setSelectedBook}
                disabled={!selectedCollection || books.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select book" />
                </SelectTrigger>
                <SelectContent>
                  {books.map((book) => (
                    <SelectItem key={book.bookNumber} value={book.bookNumber}>
                      {book.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Chapter selection */}
          <div>
            <label className="text-sm font-medium mb-1 block">Chapter</label>
            {isLoadingChapters ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={selectedChapter?.toString() || ""}
                onValueChange={(value) => setSelectedChapter(value ? Number(value) : null)}
                disabled={!selectedBook || chapters.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select chapter" />
                </SelectTrigger>
                <SelectContent>
                  {chapters.map((chapter) => (
                    <SelectItem key={chapter.chapterId} value={chapter.chapterNumber.toString()}>
                      {chapter.chapterTitle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      )}
      
      {/* Translation language selector */}
      <div className="mb-6">
        <label className="text-sm font-medium mb-1 block">Translation</label>
        <Select
          value={translationLanguage}
          onValueChange={(value) => setTranslationLanguage(value as TranslationLanguage)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="english">English</SelectItem>
            <SelectItem value="urdu">Urdu</SelectItem>
            <SelectItem value="hindi">Hindi</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Hadiths display */}
      <div className="space-y-6">
        {isLoadingHadiths ? (
          renderHadithSkeletons()
        ) : hadiths.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hadiths found</p>
          </div>
        ) : (
          hadiths.map((hadith) => (
            <Card key={hadith.hadithNumber} className="mb-4 relative">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Hadith #{hadith.hadithNumber}</span>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    {hadith.grades.map((grade, idx) => (
                      <span key={idx} className="px-2 py-1 bg-primary/10 rounded-md">
                        {grade.grade} {grade.graded_by ? `(${grade.graded_by})` : ''}
                      </span>
                    ))}
                  </div>
                </CardTitle>
                <CardDescription>
                  {collections.find(c => c.collection === hadith.collection)?.name || hadith.collection} - 
                  Book {hadith.bookNumber}
                  {hadith.chapterNumber ? `, Chapter ${hadith.chapterNumber}` : ''}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="text" className="w-full">
                  <TabsList className="w-full mb-2 grid grid-cols-2">
                    <TabsTrigger value="text">Arabic</TabsTrigger>
                    <TabsTrigger value="translation">Translation</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="text">
                    <div 
                      className="text-right mb-4 p-4 bg-primary/5 rounded-md font-arabic text-lg leading-loose" 
                      dir="rtl"
                    >
                      {hadith.text}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="translation">
                    {translationLanguage === 'english' && (
                      <div className="mb-4 p-4 bg-primary/5 rounded-md">
                        {hadith.translations.english}
                      </div>
                    )}
                    
                    {translationLanguage === 'urdu' && (
                      <div 
                        className="text-right mb-4 p-4 bg-primary/5 rounded-md font-urdu text-lg leading-loose" 
                        dir="rtl"
                      >
                        {hadith.translations.urdu}
                      </div>
                    )}
                    
                    {translationLanguage === 'hindi' && (
                      <div className="mb-4 p-4 bg-primary/5 rounded-md font-hindi text-lg">
                        {hadith.translations.hindi}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
              
              <CardFooter className="flex justify-between border-t pt-4">
                <Button variant="outline" size="sm">
                  Bookmark
                </Button>
                <Button variant="outline" size="sm">
                  Share
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
        
        {renderPagination()}
      </div>
    </div>
  );
}