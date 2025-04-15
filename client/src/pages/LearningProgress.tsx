import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Award, Bookmark, CheckCircle2, Star, Clock, Calendar, BookText, BookMarked, Timer } from "lucide-react";

// Define badge types and data
const BADGES = [
  {
    id: "quran_starter",
    name: "Quran Explorer",
    description: "Started your Quran journey",
    icon: <BookOpen className="h-5 w-5" />,
    color: "bg-blue-500",
    criteria: "Read your first Surah",
    unlocked: true,
    progress: 100,
  },
  {
    id: "hadith_learner",
    name: "Hadith Learner",
    description: "Discovering authentic traditions",
    icon: <BookText className="h-5 w-5" />,
    color: "bg-indigo-600",
    criteria: "Read 10 Hadiths",
    unlocked: true,
    progress: 100,
  },
  {
    id: "prayer_tracker",
    name: "Prayer Guardian",
    description: "Track your daily prayers",
    icon: <Clock className="h-5 w-5" />,
    color: "bg-green-600",
    criteria: "Check prayer times for 5 days",
    unlocked: true,
    progress: 100,
  },
  {
    id: "quran_bookmark",
    name: "Quran Bookmarker",
    description: "Create your first Quran bookmark",
    icon: <Bookmark className="h-5 w-5" />,
    color: "bg-yellow-500",
    criteria: "Save 3 bookmarks in Quran",
    unlocked: true,
    progress: 100,
  },
  {
    id: "consistent_reader",
    name: "Consistent Reader",
    description: "Read Quran for consecutive days",
    icon: <Calendar className="h-5 w-5" />,
    color: "bg-purple-600",
    criteria: "Read Quran for 7 consecutive days",
    unlocked: false,
    progress: 71,
  },
  {
    id: "meditation_beginner",
    name: "Mindful Muslim",
    description: "Started meditation practice",
    icon: <Timer className="h-5 w-5" />,
    color: "bg-teal-600",
    criteria: "Complete 5 meditation sessions",
    unlocked: false,
    progress: 40,
  },
  {
    id: "quran_half",
    name: "Halfway Through",
    description: "Read half of the Quran",
    icon: <BookMarked className="h-5 w-5" />,
    color: "bg-rose-600",
    criteria: "Read 50% of the Quran",
    unlocked: false,
    progress: 23,
  },
  {
    id: "seeker_of_knowledge",
    name: "Knowledge Seeker",
    description: "Ask questions to learn more",
    icon: <BookOpen className="h-5 w-5" />,
    color: "bg-orange-500",
    criteria: "Ask 5 questions about Islam",
    unlocked: false,
    progress: 60,
  },
];

// Define avatar options
const AVATARS = [
  {
    id: "scholar",
    name: "Scholar",
    image: "https://api.dicebear.com/7.x/bottts/svg?seed=scholar&backgroundColor=b6e3f4",
    unlocked: true,
  },
  {
    id: "mosque",
    name: "Mosque Guardian",
    image: "https://api.dicebear.com/7.x/bottts/svg?seed=mosque&backgroundColor=d1d4f9",
    unlocked: true,
  },
  {
    id: "reader",
    name: "Quran Reader",
    image: "https://api.dicebear.com/7.x/bottts/svg?seed=reader&backgroundColor=c0aede",
    unlocked: false,
  },
  {
    id: "traveler",
    name: "Knowledge Traveler",
    image: "https://api.dicebear.com/7.x/bottts/svg?seed=traveler&backgroundColor=ffdfbf",
    unlocked: false,
  },
];

// Mock learning stats
const LEARNING_STATS = {
  quranProgress: 17,
  quranDaysStreak: 5,
  hadithsRead: 28,
  questionsAsked: 3,
  prayerTimeCheckIns: 15,
  meditationSessions: 2,
  totalReadingTime: 287, // In minutes
  totalPoints: 345,
};

// Learning categories progress
const CATEGORIES = [
  {
    name: "Quran",
    progress: 17,
    icon: <BookOpen className="h-5 w-5" />,
    color: "bg-blue-500",
  },
  {
    name: "Hadith",
    progress: 35,
    icon: <BookText className="h-5 w-5" />,
    color: "bg-indigo-600",
  },
  {
    name: "Prayer",
    progress: 60,
    icon: <Clock className="h-5 w-5" />,
    color: "bg-green-600",
  },
  {
    name: "Meditation",
    progress: 20,
    icon: <Timer className="h-5 w-5" />,
    color: "bg-teal-600",
  },
];

export default function LearningProgress() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedAvatar, setSelectedAvatar] = useState("scholar");
  const { toast } = useToast();
  
  // Handle avatar selection
  const handleAvatarSelect = (avatarId: string) => {
    const avatar = AVATARS.find(a => a.id === avatarId);
    
    if (avatar && !avatar.unlocked) {
      toast({
        title: "Avatar Locked",
        description: "Continue your Islamic learning journey to unlock this avatar!",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedAvatar(avatarId);
    
    toast({
      title: "Avatar Changed",
      description: `You are now using the ${avatar?.name} avatar!`,
    });
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-2 text-primary">Your Islamic Learning Journey</h1>
      <p className="text-center text-muted-foreground mb-8">Track your progress, earn badges, and grow in knowledge</p>
      
      <Tabs defaultValue="overview" className="w-full" onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="badges">Achievements</TabsTrigger>
          <TabsTrigger value="profile">My Profile</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Profile Summary */}
            <Card className="shadow-lg border-2 border-green-100 dark:border-green-900">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Award className="h-5 w-5 text-primary" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-20 w-20 border-2 border-primary">
                    <AvatarImage src={AVATARS.find(a => a.id === selectedAvatar)?.image} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="text-lg font-semibold">Faithful Learner</h3>
                    <p className="text-sm text-muted-foreground">Level 3 Scholar</p>
                    <div className="flex items-center mt-1">
                      <Progress value={65} className="h-2 w-32" />
                      <span className="text-xs ml-2">Level 4 in 248 pts</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center justify-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-2xl font-bold text-primary">{LEARNING_STATS.quranDaysStreak}</span>
                    <span className="text-xs text-center">Days Streak</span>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-2xl font-bold text-primary">{LEARNING_STATS.totalPoints}</span>
                    <span className="text-xs text-center">Total Points</span>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-2xl font-bold text-primary">
                      {BADGES.filter(badge => badge.unlocked).length}/{BADGES.length}
                    </span>
                    <span className="text-xs text-center">Badges Earned</span>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-2xl font-bold text-primary">
                      {Math.floor(LEARNING_STATS.totalReadingTime / 60)}h {LEARNING_STATS.totalReadingTime % 60}m
                    </span>
                    <span className="text-xs text-center">Learning Time</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Categories Progress */}
            <Card className="shadow-lg border-2 border-green-100 dark:border-green-900">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Learning Categories
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {CATEGORIES.map((category) => (
                    <div key={category.name} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`p-1.5 rounded-md ${category.color} text-white mr-2`}>
                            {category.icon}
                          </div>
                          <span>{category.name}</span>
                        </div>
                        <span className="text-sm">{category.progress}%</span>
                      </div>
                      <Progress value={category.progress} className="h-2" />
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Recent Activity</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                        Read Surah Al-Baqarah
                      </span>
                      <span className="text-xs text-muted-foreground">2 days ago</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <BookText className="h-4 w-4 text-indigo-600" />
                        Read 5 Hadith from Bukhari
                      </span>
                      <span className="text-xs text-muted-foreground">3 days ago</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <Timer className="h-4 w-4 text-teal-600" />
                        5 min meditation session
                      </span>
                      <span className="text-xs text-muted-foreground">Today</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            {/* Additional Stats */}
            <Card className="shadow-lg border-2 border-green-100 dark:border-green-900 md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Detailed Statistics
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Quran Progress</span>
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <p className="mt-2 text-2xl font-semibold">{LEARNING_STATS.quranProgress}%</p>
                    <p className="text-xs text-muted-foreground">Of the Quran completed</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Hadiths Read</span>
                      <BookText className="h-4 w-4 text-primary" />
                    </div>
                    <p className="mt-2 text-2xl font-semibold">{LEARNING_STATS.hadithsRead}</p>
                    <p className="text-xs text-muted-foreground">Authentic hadiths studied</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Prayer Check-ins</span>
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <p className="mt-2 text-2xl font-semibold">{LEARNING_STATS.prayerTimeCheckIns}</p>
                    <p className="text-xs text-muted-foreground">Prayer time lookups</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Meditation</span>
                      <Timer className="h-4 w-4 text-primary" />
                    </div>
                    <p className="mt-2 text-2xl font-semibold">{LEARNING_STATS.meditationSessions}</p>
                    <p className="text-xs text-muted-foreground">Reflection sessions</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium text-sm mb-3">Suggested Next Steps</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button variant="outline" className="justify-start border-dashed">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Continue Quran reading
                    </Button>
                    <Button variant="outline" className="justify-start border-dashed">
                      <Timer className="mr-2 h-4 w-4" />
                      Try meditation for 10 minutes
                    </Button>
                    <Button variant="outline" className="justify-start border-dashed">
                      <BookText className="mr-2 h-4 w-4" />
                      Read more Hadith collections
                    </Button>
                    <Button variant="outline" className="justify-start border-dashed">
                      <Award className="mr-2 h-4 w-4" />
                      Complete badge challenges
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="badges" className="mt-6">
          <Card className="shadow-lg border-2 border-green-100 dark:border-green-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Award className="h-5 w-5 text-primary" />
                Achievement Badges
              </CardTitle>
              <CardDescription>
                Track your Islamic learning achievements and unlock badges as you progress
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {BADGES.map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-lg border ${
                      badge.unlocked
                        ? "border-green-200 dark:border-green-800"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`p-3 rounded-full ${
                          badge.unlocked ? badge.color : "bg-gray-200 dark:bg-gray-700"
                        } text-white`}
                      >
                        {badge.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{badge.name}</h3>
                          {badge.unlocked && (
                            <Badge variant="outline" className="h-5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs">
                              Unlocked
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{badge.description}</p>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>Progress: {badge.progress}%</span>
                            <span>{badge.criteria}</span>
                          </div>
                          <Progress
                            value={badge.progress}
                            className={`h-1.5 ${badge.unlocked ? "bg-green-100 dark:bg-green-900" : ""}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="profile" className="mt-6">
          <Card className="shadow-lg border-2 border-green-100 dark:border-green-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Award className="h-5 w-5 text-primary" />
                Your Islamic Profile
              </CardTitle>
              <CardDescription>
                Customize your avatar and view learning achievements
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar Section */}
                <div className="w-full md:w-1/3">
                  <h3 className="text-lg font-semibold mb-3">Choose Avatar</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {AVATARS.map((avatar) => (
                      <div
                        key={avatar.id}
                        className={`relative cursor-pointer rounded-lg p-2 border-2 transition-all ${
                          selectedAvatar === avatar.id
                            ? "border-primary"
                            : "border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                        } ${!avatar.unlocked ? "opacity-50" : ""}`}
                        onClick={() => handleAvatarSelect(avatar.id)}
                      >
                        <Avatar className="h-20 w-20 mx-auto mb-2">
                          <AvatarImage src={avatar.image} alt={avatar.name} />
                          <AvatarFallback>?</AvatarFallback>
                        </Avatar>
                        <p className="text-xs text-center font-medium">{avatar.name}</p>
                        
                        {!avatar.unlocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
                            <div className="p-1.5 rounded-full bg-gray-200 dark:bg-gray-700">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Your Level</h3>
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Level 3 Scholar</span>
                        <span className="text-xs">{LEARNING_STATS.totalPoints}/500 XP</span>
                      </div>
                      <Progress value={(LEARNING_STATS.totalPoints / 500) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">
                        Earn {500 - LEARNING_STATS.totalPoints} more points to reach Level 4
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Profile Stats */}
                <div className="w-full md:w-2/3">
                  <h3 className="text-lg font-semibold mb-3">Learning Summary</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border border-green-100 dark:border-green-900">
                      <h4 className="text-sm font-medium flex items-center mb-3">
                        <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                        Quran Learning
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Progress</p>
                          <p className="font-medium">{LEARNING_STATS.quranProgress}% Complete</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Current Streak</p>
                          <p className="font-medium">{LEARNING_STATS.quranDaysStreak} days</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Read</p>
                          <p className="font-medium">Surah Al-Baqarah</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Bookmarks</p>
                          <p className="font-medium">7 saved verses</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg border border-green-100 dark:border-green-900">
                      <h4 className="text-sm font-medium flex items-center mb-3">
                        <BookText className="h-4 w-4 mr-2 text-indigo-600" />
                        Hadith Studies
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Hadiths Read</p>
                          <p className="font-medium">{LEARNING_STATS.hadithsRead} hadiths</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Collections</p>
                          <p className="font-medium">2 collections explored</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Collection</p>
                          <p className="font-medium">Sahih Bukhari</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Saved Hadiths</p>
                          <p className="font-medium">4 hadiths</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg border border-green-100 dark:border-green-900">
                      <h4 className="text-sm font-medium flex items-center mb-3">
                        <Timer className="h-4 w-4 mr-2 text-teal-600" />
                        Meditation Journey
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Sessions Completed</p>
                          <p className="font-medium">{LEARNING_STATS.meditationSessions} sessions</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Time</p>
                          <p className="font-medium">15 minutes</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Favorite Sound</p>
                          <p className="font-medium">Gentle Rain</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Session</p>
                          <p className="font-medium">Today</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="border-t pt-4 flex justify-between">
              <Button variant="outline">Reset Progress</Button>
              <Button>Save Profile</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}