import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/useUser";
import { Separator } from "@/components/ui/separator";
import { User, Settings, Shield, Bell, Sun, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/useTheme";

// Define Islamic-themed avatar options
const ISLAMIC_AVATARS = [
  {
    id: "scholar1",
    name: "Scholar",
    description: "Traditional Islamic scholar avatar",
    image: "https://api.dicebear.com/7.x/bottts/svg?seed=scholar1&backgroundColor=b6e3f4",
  },
  {
    id: "scholar2",
    name: "Modern Scholar",
    description: "Contemporary Islamic scholar avatar",
    image: "https://api.dicebear.com/7.x/bottts/svg?seed=scholar2&backgroundColor=d1d4f9",
  },
  {
    id: "mosque1",
    name: "Mosque Guardian",
    description: "Guardian of the mosque avatar",
    image: "https://api.dicebear.com/7.x/bottts/svg?seed=mosque1&backgroundColor=c0aede",
  },
  {
    id: "reader1",
    name: "Quran Reader",
    description: "Dedicated Quran reader avatar",
    image: "https://api.dicebear.com/7.x/bottts/svg?seed=reader1&backgroundColor=ffdfbf",
  },
  {
    id: "traveler1",
    name: "Knowledge Seeker",
    description: "Traveler seeking Islamic knowledge",
    image: "https://api.dicebear.com/7.x/bottts/svg?seed=traveler1&backgroundColor=c8e6c9",
  },
  {
    id: "calligrapher1",
    name: "Calligrapher",
    description: "Islamic calligraphy artist avatar",
    image: "https://api.dicebear.com/7.x/bottts/svg?seed=calligrapher1&backgroundColor=bbdefb",
  },
];

// Display preferences options
const DISPLAY_PREFERENCES = [
  {
    id: "arabicScript",
    label: "Arabic Script",
    options: [
      { value: "uthmani", label: "Uthmani Script" },
      { value: "indopak", label: "Indo-Pak Script" },
      { value: "imlaei", label: "Imlaei Script" },
    ],
  },
  {
    id: "translations",
    label: "Default Translation",
    options: [
      { value: "english", label: "English" },
      { value: "urdu", label: "Urdu" },
      { value: "hindi" },
    ],
  },
  {
    id: "quranReciter",
    label: "Default Reciter",
    options: [
      { value: "mishary", label: "Mishary Rashid Alafasy" },
      { value: "sudais", label: "Abdul Rahman Al-Sudais" },
      { value: "minshawi", label: "Mohamed Siddiq El-Minshawi" },
    ],
  },
];

export default function UserProfile() {
  const { user } = useUser();
  const { toast } = useToast();
  const { theme, toggleTheme, isGreenTheme, setIsGreenTheme } = useTheme();
  
 // User profile state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [location, setLocation] = useState<any>(user?.location || {});
  const [selectedAvatar, setSelectedAvatar] = useState(
    user?.preferences?.avatar || ISLAMIC_AVATARS[0].id
  );
  
  // Display preferences state
  const [arabicScript, setArabicScript] = useState(
    user?.preferences?.arabicScript || "uthmani"
  );
  const [translation, setTranslation] = useState(
    user?.preferences?.translation || "english"
  );
  const [reciter, setReciter] = useState(
    user?.preferences?.reciter || "mishary"
  );
  
  // Notification preferences
  const [dailyReminder, setDailyReminder] = useState(
    user?.preferences?.notifications?.dailyReminder ?? true
  );
  const [prayerAlerts, setPrayerAlerts] = useState(
    user?.preferences?.notifications?.prayerAlerts ?? true
  );
  const [weeklyDigest, setWeeklyDigest] = useState(
    user?.preferences?.notifications?.weeklyDigest ?? false
  );
  
  // Handle avatar selection
  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId);
  };
  
  // Handle save profile
  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          language: translation, // Map preferences.translation to language
          theme,                // Use theme directly
          location: {city: location.city, country: location.country}
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-2 text-primary">Your Islamic Profile</h1>
      <p className="text-center text-muted-foreground mb-8">Customize your profile and preferences</p>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Settings className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6">
          <Card className="shadow-lg border-2 border-green-100 dark:border-green-900">
            <CardHeader>
              <CardTitle className="text-xl">Personal Information</CardTitle>
              <CardDescription>
                Update your account information and customize your Islamic avatar
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
                {/* Avatar Selection */}
                <div className="w-full md:w-1/3">
                  <Label className="text-base font-medium">Your Avatar</Label>
                  <div className="mt-3 flex flex-col items-center">
                    <Avatar className="h-32 w-32 mb-3 border-2 border-primary">
                      <AvatarImage 
                        src={ISLAMIC_AVATARS.find(a => a.id === selectedAvatar)?.image} 
                        alt="User avatar" 
                      />
                      <AvatarFallback className="text-2xl">
                        {name.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm text-center font-medium">
                      {ISLAMIC_AVATARS.find(a => a.id === selectedAvatar)?.name}
                    </p>
                    <p className="text-xs text-center text-muted-foreground">
                      {ISLAMIC_AVATARS.find(a => a.id === selectedAvatar)?.description}
                    </p>
                  </div>
                </div>
                
                {/* Profile Information */}
                <div className="w-full md:w-2/3 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="Your name" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="Your email" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location (for Prayer Times)</Label>
                    <Input
                      id="location"
                      value={location.city ? `${location.city}, ${location.country}` : ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        const commaIndex = value.indexOf(',');
                        let city = "";
                        let country = "";
                        if (commaIndex !== -1) {
                          city = value.substring(0, commaIndex).trim();
                          country = value.substring(commaIndex + 1).trim();
                        } else {
                          city = value.trim();
                        }
                        setLocation({ city: city, country: country });
                      }}
                      placeholder="City, Country"
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Avatar Selection Grid */}
              <div>
                <Label className="text-base font-medium">Choose an Islamic Avatar</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                  {ISLAMIC_AVATARS.map((avatar) => (
                    <div
                      key={avatar.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedAvatar === avatar.id
                          ? "border-primary bg-green-50 dark:bg-green-900/20"
                          : "border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                      }`}
                      onClick={() => handleAvatarSelect(avatar.id)}
                    >
                      <div className="flex flex-col items-center">
                        <Avatar className="h-16 w-16 mb-2">
                          <AvatarImage src={avatar.image} alt={avatar.name} />
                          <AvatarFallback>?</AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium text-center">{avatar.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="border-t pt-4 flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="mt-6">
          <Card className="shadow-lg border-2 border-green-100 dark:border-green-900">
            <CardHeader>
              <CardTitle className="text-xl">Display Preferences</CardTitle>
              <CardDescription>
                Customize how Islamic content is displayed in the application
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Theme Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Theme Settings</Label>
                
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center">
                      {theme === "dark" ? (
                        <Moon className="h-4 w-4 mr-2" />
                      ) : (
                        <Sun className="h-4 w-4 mr-2" />
                      )}
                      <Label htmlFor="theme-mode" className="font-medium">
                        {theme === "dark" ? "Dark Mode" : "Light Mode"}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Change between light and dark mode
                    </p>
                  </div>
                  <Switch 
                    id="theme-mode" 
                    checked={theme === "dark"}
                    onCheckedChange={toggleTheme}
                  />
                </div>
                
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="green-theme" className="font-medium">Green Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Use Islamic green color scheme
                    </p>
                  </div>
                  <Switch 
                    id="green-theme" 
                    checked={isGreenTheme}
                    onCheckedChange={setIsGreenTheme}
                  />
                </div>
              </div>
              
              <Separator />
              
              {/* Content Display Preferences */}
              {DISPLAY_PREFERENCES.map((preference) => (
                <div key={preference.id} className="space-y-3">
                  <Label className="text-base font-medium">{preference.label}</Label>
                  <RadioGroup 
                    defaultValue={
                      preference.id === "arabicScript" 
                        ? arabicScript 
                        : preference.id === "translations" 
                          ? translation 
                          : reciter
                    }
                    onValueChange={(value) => {
                      if (preference.id === "arabicScript") setArabicScript(value);
                      else if (preference.id === "translations") setTranslation(value);
                      else if (preference.id === "quranReciter") setReciter(value);
                    }}
                    className="flex flex-col space-y-1"
                  >
                    {preference.options.map((option) => (
                      <div 
                        key={option.value} 
                        className="flex items-center space-x-2 rounded-md border p-3"
                      >
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
              
              <Separator />
              
              {/* Font Sizes */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Font Sizes</Label>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="arabic-font-size">Arabic Text Size</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Medium" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                          <SelectItem value="xlarge">Extra Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="translation-font-size">Translation Size</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Medium" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                          <SelectItem value="xlarge">Extra Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="border-t pt-4 flex justify-between">
              <Button variant="outline">Reset to Defaults</Button>
              <Button onClick={handleSaveProfile}>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6">
          <Card className="shadow-lg border-2 border-green-100 dark:border-green-900">
            <CardHeader>
              <CardTitle className="text-xl">Notification Settings</CardTitle>
              <CardDescription>
                Manage how you receive reminders and updates
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-base font-medium">Reminders</h3>
                
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="daily-reminder">Daily Quran Reminder</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a daily reminder to read Quran
                    </p>
                  </div>
                  <Switch 
                    id="daily-reminder" 
                    checked={dailyReminder}
                    onCheckedChange={setDailyReminder}
                  />
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="prayer-alerts">Prayer Time Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified before each prayer time
                    </p>
                  </div>
                  <Switch 
                    id="prayer-alerts" 
                    checked={prayerAlerts}
                    onCheckedChange={setPrayerAlerts}
                  />
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="weekly-digest">Weekly Learning Digest</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a weekly summary of your Islamic learning
                    </p>
                  </div>
                  <Switch 
                    id="weekly-digest" 
                    checked={weeklyDigest}
                    onCheckedChange={setWeeklyDigest}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-base font-medium">Communication Preferences</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="email-frequency">Email Frequency</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Weekly" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="rounded-lg border p-4 space-y-3">
                  <h4 className="font-medium">Notification Channels</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Checkbox id="notify-email" />
                      <Label htmlFor="notify-email" className="ml-2">
                        Email Notifications
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox id="notify-app" defaultChecked />
                      <Label htmlFor="notify-app" className="ml-2">
                        In-App Notifications
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox id="notify-push" defaultChecked />
                      <Label htmlFor="notify-push" className="ml-2">
                        Push Notifications (Mobile)
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="border-t pt-4 flex justify-between">
              <Button variant="outline">Turn Off All</Button>
              <Button onClick={handleSaveProfile}>Save Notifications</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Import components
function Select({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
    </div>
  );
}

function SelectTrigger({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
      {children}
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 opacity-50">
        <path d="m6 9 6 6 6-6"/>
      </svg>
    </div>
  );
}

function SelectValue({ placeholder }: { placeholder: string }) {
  return <span>{placeholder}</span>;
}

function SelectContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
      <div className="p-1">{children}</div>
    </div>
  );
}

function SelectItem({ value, children }: { value: string, children: React.ReactNode }) {
  return (
    <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
      {children}
    </div>
  );
}

function Checkbox({ id, defaultChecked }: { id: string, defaultChecked?: boolean }) {
  return (
    <div className="h-4 w-4 rounded-sm border border-primary flex items-center justify-center">
      {defaultChecked && (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-primary">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      )}
    </div>
  );
}
