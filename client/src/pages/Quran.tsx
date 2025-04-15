import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSurahs, getSurah, getSurahTranslation } from '@/services/quranService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

export default function Quran() {
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('browse');

  // Get all surahs for the dropdown
  const { data: surahList, isLoading: isLoadingSurahs } = useQuery({
    queryKey: ['/api/quran/surahs'],
    queryFn: () => getSurahs()
  });

  // Get details of the selected surah
  const { data: surahDetails, isLoading: isLoadingSurahDetails } = useQuery({
    queryKey: ['/api/quran/surah', selectedSurah],
    queryFn: () => getSurah(selectedSurah || 1),
    enabled: !!selectedSurah
  });

  // Get translation of the selected surah
  const { data: surahTranslation, isLoading: isLoadingTranslation } = useQuery({
    queryKey: ['/api/quran/translation', selectedSurah],
    queryFn: () => getSurahTranslation(selectedSurah || 1),
    enabled: !!selectedSurah
  });

  // Select first surah by default if none is selected
  useEffect(() => {
    if (surahList && !selectedSurah) {
      setSelectedSurah(1); // Al-Fatiha is the first surah
    }
  }, [surahList, selectedSurah]);

  const handleSurahChange = (value: string) => {
    setSelectedSurah(parseInt(value, 10));
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      // Implement search functionality here
    }
  };

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">The Holy Quran</h1>
      
      <Tabs defaultValue="browse" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
        </TabsList>
        
        <TabsContent value="browse" className="mt-6">
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/3">
                <label className="text-sm font-medium mb-2 block">Select Surah</label>
                {isLoadingSurahs ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select onValueChange={handleSurahChange} defaultValue={selectedSurah?.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Surah" />
                    </SelectTrigger>
                    <SelectContent>
                      {surahList?.map((surah: any) => (
                        <SelectItem key={surah.number} value={surah.number.toString()}>
                          {surah.number}. {surah.englishName} ({surah.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            
            {selectedSurah && (
              <Card>
                <CardHeader>
                  {isLoadingSurahDetails ? (
                    <>
                      <Skeleton className="h-8 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </>
                  ) : (
                    <>
                      <CardTitle className="flex justify-between items-center">
                        <span>{surahDetails?.englishName}</span>
                        <span className="arabic-text text-2xl">{surahDetails?.name}</span>
                      </CardTitle>
                      <CardDescription>
                        {surahDetails?.englishNameTranslation} • {surahDetails?.revelationType} • {surahDetails?.numberOfAyahs} Verses
                      </CardDescription>
                    </>
                  )}
                </CardHeader>
                <CardContent>
                  {isLoadingSurahDetails || isLoadingTranslation ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-6 w-full" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* If it's the first surah and we have the bismillah separately */}
                      {selectedSurah !== 1 && selectedSurah !== 9 && (
                        <div className="text-center arabic-text text-2xl mb-6">
                          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                        </div>
                      )}
                      
                      {/* Display verses */}
                      {surahDetails?.ayahs?.map((ayah: any, index: number) => {
                        const translation = surahTranslation?.find((item: any) => item.numberInSurah === ayah.numberInSurah);
                        
                        return (
                          <div key={ayah.number} className="border-b pb-4 last:border-0">
                            <div className="flex justify-between mb-2">
                              <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-sm">
                                {ayah.numberInSurah}
                              </span>
                            </div>
                            <p className="arabic-text text-right text-xl leading-loose mb-2">{ayah.text}</p>
                            {translation && (
                              <p className="text-gray-700">{translation.text}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="search" className="mt-6">
          <div className="flex flex-col space-y-6">
            <div className="flex gap-2">
              <Input
                placeholder="Search the Quran..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSearch}>Search</Button>
            </div>
            
            <div className="text-center text-gray-500 py-8">
              Enter a search term to find verses in the Quran
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}