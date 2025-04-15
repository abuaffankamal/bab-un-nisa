import { useState, useEffect, useRef } from 'react';
import { 
  getSurahs, 
  getSurah, 
  getSurahTranslation, 
  getAyahAudioUrl,
  getAvailableRecitations,
  Surah, 
  Ayah, 
  Translation,
  RecitationInfo
} from '@/services/quranService';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  PlayCircle, 
  PauseCircle, 
  SkipForward, 
  SkipBack,
  Volume2,
  VolumeX,
  Search,
  ChevronRight,
  ChevronLeft,
  BookOpen
} from 'lucide-react';

// Define language options
type TranslationLanguage = 'en' | 'ur' | 'hi';

const languageNames = {
  en: 'English',
  ur: 'Urdu',
  hi: 'Hindi'
};

export default function Quran() {
  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // State for Surahs
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [loadingSurahs, setLoadingSurahs] = useState<boolean>(true);
  
  // State for Ayahs
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loadingAyahs, setLoadingAyahs] = useState<boolean>(false);
  
  // State for audio
  const [recitations, setRecitations] = useState<RecitationInfo[]>([]);
  const [selectedReciter, setSelectedReciter] = useState<string>('ar.alafasy');
  const [currentAyah, setCurrentAyah] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioLoading, setAudioLoading] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  
  // State for translations
  const [translationLanguage, setTranslationLanguage] = useState<TranslationLanguage>('en');
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  
  // State for pagination and search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;
  
  const { toast } = useToast();
  
  // Load surahs on mount
  useEffect(() => {
    async function loadSurahs() {
      try {
        const data = await getSurahs();
        setSurahs(data);
      } catch (error) {
        console.error('Error loading surahs:', error);
        toast({
          title: 'Error',
          description: 'Failed to load Quran chapters. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoadingSurahs(false);
      }
    }
    
    async function loadRecitations() {
      try {
        const data = await getAvailableRecitations();
        setRecitations(data);
      } catch (error) {
        console.error('Error loading recitations:', error);
        // Set default recitations if API fails
        setRecitations([
          { name: 'Mishary Rashid Alafasy', identifier: 'ar.alafasy' },
          { name: 'Abdul Basit', identifier: 'ar.abdulbasitmurattal' },
          { name: 'Abdul Rahman Al-Sudais', identifier: 'ar.abdurrahmaansudais' },
        ]);
      }
    }
    
    loadSurahs();
    loadRecitations();
  }, [toast]);
  
  // Load ayahs when selected surah changes
  useEffect(() => {
    async function loadAyahs() {
      if (!selectedSurah) return;
      
      setLoadingAyahs(true);
      try {
        // Load Arabic text
        const ayahsData = await getSurah(selectedSurah);
        setAyahs(ayahsData);
        
        // Load translations
        const translationsData = await getSurahTranslation(selectedSurah, translationLanguage);
        setTranslations(translationsData);
        
        // Reset audio state
        setCurrentAyah(null);
        setIsPlaying(false);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
        }
      } catch (error) {
        console.error(`Error loading surah ${selectedSurah}:`, error);
        toast({
          title: 'Error',
          description: 'Failed to load Quran verses. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoadingAyahs(false);
      }
    }
    
    loadAyahs();
  }, [selectedSurah, translationLanguage, toast]);
  
  // Audio control functions
  const playAyah = async (ayahNumber: number) => {
    if (!audioRef.current) return;
    
    setAudioLoading(true);
    setCurrentAyah(ayahNumber);
    
    try {
      const audioUrl = await getAyahAudioUrl(selectedSurah, ayahNumber, selectedReciter);
      
      audioRef.current.src = audioUrl;
      audioRef.current.oncanplay = () => {
        setAudioLoading(false);
        audioRef.current?.play()
          .catch(error => {
            console.error('Error playing audio:', error);
            toast({
              title: 'Error',
              description: 'Failed to play audio. This might be due to browser autoplay restrictions.',
              variant: 'destructive',
            });
          });
        setIsPlaying(true);
      };
      
      audioRef.current.onerror = (e) => {
        console.error('Audio error:', e);
        setAudioLoading(false);
        setIsPlaying(false);
        toast({
          title: 'Error',
          description: 'Failed to load audio. Please try a different reciter.',
          variant: 'destructive',
        });
      };
    } catch (error) {
      console.error('Error getting audio URL:', error);
      setAudioLoading(false);
      toast({
        title: 'Error',
        description: 'Failed to get audio URL. Please try again later.',
        variant: 'destructive',
      });
    }
  };
  
  const togglePlay = () => {
    if (!audioRef.current || currentAyah === null) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };
  
  const playNext = () => {
    if (currentAyah === null || !ayahs.length) return;
    
    const nextAyah = currentAyah + 1;
    if (nextAyah <= ayahs.length) {
      void playAyah(nextAyah);
    } else {
      // If at the end of the surah, go to the next surah
      if (selectedSurah < surahs.length) {
        setSelectedSurah(selectedSurah + 1);
        // First ayah of the next surah will be played after the new surah loads
        setTimeout(() => void playAyah(1), 1000);
      }
    }
  };
  
  const playPrevious = () => {
    if (currentAyah === null || !ayahs.length) return;
    
    const prevAyah = currentAyah - 1;
    if (prevAyah >= 1) {
      void playAyah(prevAyah);
    } else {
      // If at the beginning of the surah, go to the previous surah
      if (selectedSurah > 1) {
        setSelectedSurah(selectedSurah - 1);
        // Will play the last ayah of the previous surah
        setTimeout(() => {
          const lastAyahNumber = surahs.find(s => s.number === selectedSurah - 1)?.numberOfAyahs || 1;
          void playAyah(lastAyahNumber);
        }, 1000);
      }
    }
  };
  
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };
  
  // Handle audio ending - auto play next ayah
  useEffect(() => {
    const audio = audioRef.current;
    
    const handleEnded = () => {
      playNext();
    };
    
    if (audio) {
      audio.addEventListener('ended', handleEnded);
      
      return () => {
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [currentAyah, ayahs.length, selectedSurah]);
  
  // Change reciter
  const handleReciterChange = (reciterId: string) => {
    setSelectedReciter(reciterId);
    
    // If currently playing, reload the current ayah with the new reciter
    if (currentAyah !== null && isPlaying) {
      void playAyah(currentAyah);
    }
  };
  
  // Change translation language
  const handleLanguageChange = (language: TranslationLanguage) => {
    setTranslationLanguage(language);
  };
  
  // Pagination functions
  const totalPages = Math.ceil(ayahs.length / pageSize);
  
  const paginatedAyahs = ayahs.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  
  const paginatedTranslations = translations.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  
  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      // Stop audio when changing pages
      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };
  
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxDisplayedPages = 5;
    
    if (totalPages <= maxDisplayedPages) {
      // Show all pages if there are fewer than max
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Show ellipsis or pages around current page
      if (page > 3) {
        pageNumbers.push(-1); // -1 represents ellipsis
      }
      
      // Show current page and neighbors
      const startPage = Math.max(2, page - 1);
      const endPage = Math.min(totalPages - 1, page + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        if (i > 1 && i < totalPages) {
          pageNumbers.push(i);
        }
      }
      
      // Show ellipsis before last page if needed
      if (page < totalPages - 2) {
        pageNumbers.push(-2); // -2 represents ellipsis
      }
      
      // Always show last page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };
  
  // Search functionality - just a placeholder for now 
  const handleSearch = () => {
    // In a real implementation, this would search through the Quran
    toast({
      title: 'Search',
      description: `Searching for: ${searchQuery}`,
    });
  };
  
  // Get the name of the current surah
  const currentSurahName = surahs.find(s => s.number === selectedSurah)?.englishName || '';
  const currentSurahArabicName = surahs.find(s => s.number === selectedSurah)?.name || '';
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">The Holy Quran</h1>
        <p className="text-muted-foreground text-center">
          Read, listen, and understand the Quran in multiple languages
        </p>
      </div>
      
      {/* Audio Player */}
      <div className="mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={playPrevious}
                  disabled={currentAyah === null || currentAyah === 1 && selectedSurah === 1}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                
                {audioLoading ? (
                  <Button variant="outline" size="icon" disabled>
                    <Skeleton className="h-5 w-5 rounded-full" />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={togglePlay}
                    disabled={currentAyah === null}
                  >
                    {isPlaying ? (
                      <PauseCircle className="h-5 w-5" />
                    ) : (
                      <PlayCircle className="h-5 w-5" />
                    )}
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={playNext}
                  disabled={
                    currentAyah === null || 
                    (currentAyah === ayahs.length && selectedSurah === surahs.length)
                  }
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleMute}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                
                {currentAyah !== null && (
                  <span className="text-sm">
                    Ayah {currentAyah} of {ayahs.length}
                  </span>
                )}
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
                <div className="w-full md:w-auto">
                  <Select
                    value={selectedReciter}
                    onValueChange={handleReciterChange}
                    disabled={recitations.length === 0}
                  >
                    <SelectTrigger className="w-full md:w-[220px]">
                      <SelectValue placeholder="Select reciter" />
                    </SelectTrigger>
                    <SelectContent>
                      {recitations.map((recitation) => (
                        <SelectItem key={recitation.identifier} value={recitation.identifier}>
                          {recitation.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full md:w-auto">
                  <Select
                    value={translationLanguage}
                    onValueChange={(value) => handleLanguageChange(value as TranslationLanguage)}
                  >
                    <SelectTrigger className="w-full md:w-[160px]">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(languageNames).map(([code, name]) => (
                        <SelectItem key={code} value={code}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Hidden audio element */}
        <audio ref={audioRef} preload="auto" />
      </div>
      
      {/* Surah Selection and Search */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1">
          <div className="flex flex-col space-y-2">
            <label htmlFor="surah-select" className="text-sm font-medium">
              Select Surah
            </label>
            {loadingSurahs ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={selectedSurah.toString()}
                onValueChange={(value) => setSelectedSurah(Number(value))}
              >
                <SelectTrigger className="w-full" id="surah-select">
                  <SelectValue placeholder="Select a Surah" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {surahs.map((surah) => (
                    <SelectItem key={surah.number} value={surah.number.toString()}>
                      {surah.number}. {surah.englishName} ({surah.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        
        <div className="col-span-2">
          <div className="flex flex-col space-y-2">
            <label htmlFor="search-quran" className="text-sm font-medium">
              Search the Quran
            </label>
            <div className="flex space-x-2">
              <Input
                id="search-quran"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for words or phrases..."
                className="flex-1"
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Surah Information */}
      {!loadingSurahs && selectedSurah && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">{currentSurahName}</CardTitle>
                <CardDescription>
                  {surahs.find(s => s.number === selectedSurah)?.englishNameTranslation} • 
                  {surahs.find(s => s.number === selectedSurah)?.revelationType === 'Meccan' 
                    ? ' Revealed in Mecca' 
                    : ' Revealed in Medina'
                  }
                </CardDescription>
              </div>
              <div className="text-right">
                <CardTitle className="text-2xl font-arabic" dir="rtl">{currentSurahArabicName}</CardTitle>
                <CardDescription>
                  {surahs.find(s => s.number === selectedSurah)?.numberOfAyahs} Verses
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}
      
      {/* Ayahs Display */}
      <div className="mb-8">
        {loadingAyahs ? (
          // Show loading skeletons
          Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="mb-4">
              <CardHeader>
                <Skeleton className="h-6 w-16" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full mb-2" />
                {showTranslation && (
                  <Skeleton className="h-16 w-full" />
                )}
              </CardContent>
            </Card>
          ))
        ) : paginatedAyahs.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No verses found. Please select a different surah.
            </p>
          </div>
        ) : (
          <>
            {/* Tabs for display mode */}
            <Tabs defaultValue="combined" className="mb-6">
              <TabsList className="grid w-full md:w-[400px] grid-cols-3">
                <TabsTrigger value="combined">Combined</TabsTrigger>
                <TabsTrigger value="arabic-only">Arabic Only</TabsTrigger>
                <TabsTrigger value="translation-only">Translation Only</TabsTrigger>
              </TabsList>
              
              {/* Combined View */}
              <TabsContent value="combined">
                {paginatedAyahs.map((ayah, index) => {
                  const translation = paginatedTranslations[index];
                  const ayahNumber = ayah.numberInSurah;
                  
                  return (
                    <Card key={ayah.number} className="mb-4">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">Ayah {ayahNumber}</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void playAyah(ayahNumber)}
                            className="h-8 w-8 p-0"
                          >
                            <PlayCircle className="h-5 w-5" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        {/* Arabic text */}
                        <p 
                          className="text-xl md:text-2xl font-arabic text-right leading-loose mb-4 py-2"
                          dir="rtl"
                        >
                          {ayah.text}
                        </p>
                        
                        <Separator className="my-2" />
                        
                        {/* Translation */}
                        <div className={translationLanguage === 'ur' ? 'text-right font-urdu' : ''} 
                             dir={translationLanguage === 'ur' ? 'rtl' : 'ltr'}>
                          <p 
                            className={`
                              ${translationLanguage === 'ur' ? 'text-lg font-urdu' : 'text-md'} 
                              ${translationLanguage === 'hi' ? 'font-hindi' : ''}
                              leading-relaxed
                            `}
                          >
                            {translation?.text}
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0 text-xs text-muted-foreground border-t">
                        <div className="flex w-full justify-between">
                          <span>Juz {ayah.juz}</span>
                          <span>Page {ayah.page}</span>
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
              </TabsContent>
              
              {/* Arabic Only View */}
              <TabsContent value="arabic-only">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4" dir="rtl">
                      {paginatedAyahs.map((ayah) => (
                        <div key={ayah.number} className="group relative pb-4">
                          <div className="absolute right-0 -mt-6 opacity-70">
                            <span className="text-sm font-semibold">{ayah.numberInSurah}</span>
                          </div>
                          <p className="text-xl md:text-2xl font-arabic text-right leading-loose pr-6">
                            {ayah.text}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void playAyah(ayah.numberInSurah)}
                            className="absolute left-0 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <PlayCircle className="h-5 w-5" />
                          </Button>
                          {ayah.numberInSurah < paginatedAyahs.length && (
                            <Separator className="mt-4" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Translation Only View */}
              <TabsContent value="translation-only">
                <Card>
                  <CardContent className="pt-6">
                    <div 
                      className="space-y-4" 
                      dir={translationLanguage === 'ur' ? 'rtl' : 'ltr'}
                    >
                      {paginatedTranslations.map((translation, index) => (
                        <div key={index} className="group relative pb-4">
                          <div className={`absolute ${translationLanguage === 'ur' ? 'right-0' : 'left-0'} -mt-6 opacity-70`}>
                            <span className="text-sm font-semibold">{index + 1 + (page - 1) * pageSize}</span>
                          </div>
                          <p 
                            className={`
                              ${translationLanguage === 'ur' ? 'text-lg font-urdu text-right pr-6' : 'text-md pl-6'} 
                              ${translationLanguage === 'hi' ? 'font-hindi' : ''}
                              leading-relaxed
                            `}
                          >
                            {translation.text}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void playAyah(translation.ayah.numberInSurah)}
                            className={`absolute ${translationLanguage === 'ur' ? 'left-0' : 'right-0'} top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity`}
                          >
                            <PlayCircle className="h-5 w-5" />
                          </Button>
                          {index < paginatedTranslations.length - 1 && (
                            <Separator className="mt-4" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
      
      {/* Pagination */}
      {!loadingAyahs && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          {renderPageNumbers().map((pageNum, index) => {
            if (pageNum < 0) {
              // Render ellipsis
              return <span key={`ellipsis-${index}`}>...</span>;
            }
            
            return (
              <Button
                key={pageNum}
                variant={pageNum === page ? "default" : "outline"}
                size="sm"
                onClick={() => goToPage(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}