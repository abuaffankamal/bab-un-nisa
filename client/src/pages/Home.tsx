import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showPlayButton, setShowPlayButton] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.play().catch(() => {
        setShowPlayButton(true);
      });
    }
  }, []);

  const handlePlay = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.play();
      setShowPlayButton(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="home-hero">
        <div className="hero-image" style={{ backgroundImage: "url('/assets/islamic-background.jpg')" }}></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          {/* Ayat Section moved here */}
          <div className="mb-6">
            <p className="text-center text-lg md:text-xl font-arabic font-bold text-white drop-shadow-lg">
              يَـٰعِبَادِىَ ٱلَّذِينَ ءَامَنُوٓا۟ إِنَّ أَرْضِى وَٰسِعَةٌۭ فَإِيَّـٰىَ فَٱعْبُدُونِ &#x6DD; كُلُّ نَفْسٍۢ ذَآئِقَةُ ٱلْمَوْتِ ۖ ثُمَّ إِلَيْنَا تُرْجَعُونَ &#x6DD;
            </p>
            <audio ref={audioRef} className="mx-auto mt-2">
              <source src="/assets/sounds/ayat.mp3" type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
            {showPlayButton && (
              <button
                onClick={handlePlay}
                className="mt-4 px-4 py-2 bg-green-700 text-white font-bold rounded shadow hover:bg-green-800"
              >
                ▶ Play Ayat Audio
              </button>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white">Bab-un-Nisa</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl text-white">
            Your comprehensive Islamic resource for Quran, Hadith, Prayer Times, and more
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-green-700">
              <Link href="/qibla">Qibla Direction</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-green-700">
              <Link href="/quran">Start Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-green-700">
              <Link href="/prayer-times">Prayer Times</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
