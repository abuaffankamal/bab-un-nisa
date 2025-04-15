import axios from 'axios';

// Base URL for AlQuran.cloud API
const API_BASE_URL = 'https://api.alquran.cloud/v1';

// Types for Quran data
export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
}

export interface Ayah {
  number: number;
  text: string;
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: string;
    numberOfAyahs: number;
  };
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | { recommended: boolean; obligatory: boolean };
}

export interface Translation {
  ayah: Ayah;
  text: string;
}

export interface RecitationInfo {
  name: string;
  identifier: string;
}

// API Functions

// Get list of all Surahs (chapters)
export async function getSurahs(): Promise<Surah[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/surah`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching surahs:', error);
    throw error;
  }
}

// Get a specific Surah with its ayahs
export async function getSurah(surahNumber: number, edition: string = 'quran-uthmani'): Promise<Ayah[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/surah/${surahNumber}/${edition}`);
    return response.data.data.ayahs;
  } catch (error) {
    console.error(`Error fetching surah ${surahNumber}:`, error);
    throw error;
  }
}

// Get translation for a specific Surah
export async function getSurahTranslation(
  surahNumber: number,
  language: 'en' | 'ur' | 'hi' = 'en'
): Promise<Translation[]> {
  // Map language codes to edition identifiers
  const editionMap = {
    en: 'en.sahih',    // English - Sahih International
    ur: 'ur.maududi',  // Urdu - Maududi
    hi: 'hi.hindi',    // Hindi
  };

  try {
    const edition = editionMap[language];
    const response = await axios.get(`${API_BASE_URL}/surah/${surahNumber}/${edition}`);
    return response.data.data.ayahs.map((ayah: any) => ({
      ayah: {
        number: ayah.number,
        numberInSurah: ayah.numberInSurah,
        surah: response.data.data.surah,
        juz: ayah.juz,
        manzil: ayah.manzil,
        page: ayah.page,
        ruku: ayah.ruku,
        hizbQuarter: ayah.hizbQuarter,
        sajda: ayah.sajda,
      },
      text: ayah.text,
    }));
  } catch (error) {
    console.error(`Error fetching translation for surah ${surahNumber}:`, error);
    throw error;
  }
}

// Get audio recitation for a specific Surah
export async function getSurahRecitation(
  surahNumber: number, 
  reciter: string = 'ar.alafasy'
): Promise<string[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/surah/${surahNumber}/${reciter}`);
    // Extract audio URLs from the response
    return response.data.data.ayahs.map((ayah: any) => ayah.audio);
  } catch (error) {
    console.error(`Error fetching recitation for surah ${surahNumber}:`, error);
    throw error;
  }
}

// Get available recitation styles/reciters
export async function getAvailableRecitations(): Promise<RecitationInfo[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/edition/format/audio`);
    return response.data.data.map((edition: any) => ({
      name: edition.englishName,
      identifier: edition.identifier,
    }));
  } catch (error) {
    console.error('Error fetching available recitations:', error);
    throw error;
  }
}

// Search the Quran for a specific term
export async function searchQuran(query: string, language: 'en' | 'ur' | 'hi' = 'en'): Promise<any> {
  // Map language codes to edition identifiers
  const editionMap = {
    en: 'en.sahih',
    ur: 'ur.maududi',
    hi: 'hi.hindi',
  };

  try {
    const edition = editionMap[language];
    const response = await axios.get(`${API_BASE_URL}/search/${query}/all/${edition}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error searching Quran for "${query}":`, error);
    throw error;
  }
}

// Get a specific Ayah with translations in multiple languages
export async function getAyahWithTranslations(
  surahNumber: number, 
  ayahNumber: number
): Promise<{
  arabic: string;
  translations: { [key: string]: string };
}> {
  try {
    // Fetch the original Arabic text
    const arabicResponse = await axios.get(
      `${API_BASE_URL}/ayah/${surahNumber}:${ayahNumber}/quran-uthmani`
    );
    
    // Fetch translations
    const enResponse = await axios.get(
      `${API_BASE_URL}/ayah/${surahNumber}:${ayahNumber}/en.sahih`
    );
    
    const urResponse = await axios.get(
      `${API_BASE_URL}/ayah/${surahNumber}:${ayahNumber}/ur.maududi`
    );
    
    const hiResponse = await axios.get(
      `${API_BASE_URL}/ayah/${surahNumber}:${ayahNumber}/hi.hindi`
    );
    
    return {
      arabic: arabicResponse.data.data.text,
      translations: {
        english: enResponse.data.data.text,
        urdu: urResponse.data.data.text,
        hindi: hiResponse.data.data.text,
      },
    };
  } catch (error) {
    console.error(`Error fetching ayah ${surahNumber}:${ayahNumber} with translations:`, error);
    throw error;
  }
}

// Get the absolute number of an Ayah based on Surah and Ayah position
async function getAbsoluteAyahNumber(surahNumber: number, ayahNumberInSurah: number): Promise<number> {
  try {
    // Method 1: Get the absolute number directly from the API
    const response = await axios.get(`${API_BASE_URL}/ayah/${surahNumber}:${ayahNumberInSurah}`);
    return response.data.data.number;
  } catch (error) {
    console.error(`Error getting absolute ayah number from direct API call:`, error);
    
    // Method 2: Calculate based on the first ayah in the surah
    try {
      const surahResponse = await axios.get(`${API_BASE_URL}/surah/${surahNumber}`);
      if (surahResponse.data.data.ayahs && surahResponse.data.data.ayahs.length > 0) {
        const firstAyahNumber = surahResponse.data.data.ayahs[0].number;
        return firstAyahNumber + ayahNumberInSurah - 1;
      }
      throw new Error('Could not determine first ayah number');
    } catch (innerError) {
      console.error(`Error calculating absolute ayah number:`, innerError);
      
      // Method 3: Use a static mapping for the first surah of each juz
      // This is not complete, but works for the first few surahs
      const surahStartingPoints: Record<number, number> = {
        1: 1,    // Al-Fatiha starts at ayah 1
        2: 8,    // Al-Baqarah starts at ayah 8
        3: 294,  // Al-Imran starts at ayah 294
        4: 493   // An-Nisa starts at ayah 493
      };
      
      const startPoint = surahStartingPoints[surahNumber] || 1;
      return startPoint + ayahNumberInSurah - 1;
    }
  }
}

// Get audio URL for a specific Ayah
export async function getAyahAudioUrl(surahNumber: number, ayahNumberInSurah: number, reciter: string = 'ar.alafasy'): Promise<string> {
  try {
    // First try to get the ayah directly from the reciter's edition
    const directResponse = await axios.get(`${API_BASE_URL}/ayah/${surahNumber}:${ayahNumberInSurah}/${reciter}`);
    if (directResponse.data.data.audio) {
      return directResponse.data.data.audio;
    }
    
    // If that doesn't work, calculate the absolute ayah number and construct the URL
    const absoluteAyahNumber = await getAbsoluteAyahNumber(surahNumber, ayahNumberInSurah);
    return `https://cdn.islamic.network/quran/audio/128/${reciter}/${absoluteAyahNumber}.mp3`;
    
  } catch (error) {
    console.error(`Error getting ayah audio URL:`, error);
    
    // Direct fallback to constructed URL with the ayah number in surah
    // This may not work for all reciters but provides a last resort
    return `https://cdn.islamic.network/quran/audio/128/${reciter}/${ayahNumberInSurah}.mp3`;
  }
}