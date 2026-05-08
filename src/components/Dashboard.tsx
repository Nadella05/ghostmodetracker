import { useState } from 'react';
import { Plus, Calendar as CalendarIcon, BarChart3, Settings, CheckCircle, Ghost, Droplets, Flame } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useHabitContext } from '@/contexts/HabitContext';
import { HabitCard } from '@/components/HabitCard';
import { HabitForm } from '@/components/HabitForm';
import { CalendarView } from '@/components/CalendarView';
import { AnalyticsView } from '@/components/AnalyticsView';
import { SettingsView } from '@/components/SettingsView';
import { Onboarding } from '@/components/Onboarding';
import { WaterTracker } from '@/components/WaterTracker';
import { CalorieChat } from '@/components/CalorieChat';
import { DailySummary } from '@/components/DailySummary';
import { XPDisplay } from '@/components/XPDisplay';
import { DesktopSidebar } from '@/components/DesktopSidebar';
import { DesktopRightPanel } from '@/components/DesktopRightPanel';
import { Button } from '@/components/ui/button';
import { Habit, ThemeColor } from '@/types/habit';

type Tab = 'today' | 'water' | 'calories' | 'calendar' | 'analytics' | 'settings';

export function Dashboard() {
  const { 
    getTodaysHabits, 
    habits, 
    isGhostMode, 
    profile, 
    needsOnboarding,
    completeOnboarding,
    waterTracker,
    xpSystem
  } = useHabitContext();
  const [activeTab, setActiveTab] = useState<Tab>('today');
  const [formOpen, setFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Show onboarding if not completed
  if (needsOnboarding) {
    return (
      <Onboarding 
        onComplete={(name: string, themeColor: ThemeColor) => {
          completeOnboarding(name, themeColor);
        }} 
      />
    );
  }

  const todaysHabits = getTodaysHabits();
  const completedToday = todaysHabits.filter(h => {
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    if ((h.timesPerDay || 1) > 1) {
      return (h.progress?.[dateStr] || 0) >= (h.timesPerDay || 1);
    }
    return h.completedDates.includes(dateStr);
  }).length;

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setFormOpen(true);
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) setEditingHabit(null);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'today', label: 'Today', icon: <CheckCircle className="h-5 w-5" /> },
    { id: 'water', label: 'Water', icon: <Droplets className="h-5 w-5" /> },
    { id: 'calories', label: 'Calories', icon: <Flame className="h-5 w-5" /> },
    { id: 'analytics', label: 'Stats', icon: <BarChart3 className="h-5 w-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <DesktopSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddHabit={() => setFormOpen(true)}
      />

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b">
          <div className="container max-w-lg lg:max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {isGhostMode && <Ghost className="h-4 w-4 shrink-0" />}
                  <h1 className="text-xl lg:text-2xl font-bold truncate">
                    {activeTab === 'today' && (
                      <>
                        {getGreeting()}, <span className="text-primary">{profile.name}</span>
                      </>
                    )}
                    {activeTab === 'water' && 'Hydration'}
                    {activeTab === 'calories' && 'Calories'}
                    {/* calendar tab removed */}
                    {activeTab === 'analytics' && 'Analytics'}
                    {activeTab === 'settings' && 'Settings'}
                  </h1>
                </div>
                {activeTab === 'today' && (
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(), 'EEEE, MMMM d')}
                  </p>
                )}
              </div>

              {!isGhostMode && activeTab === 'today' && (
                <XPDisplay compact />
              )}

              {activeTab === 'today' && todaysHabits.length > 0 && isGhostMode && (
                <div className="text-right font-mono">
                  <p className="text-2xl font-bold">
                    {completedToday}/{todaysHabits.length}
                  </p>
                  <p className="text-xs text-muted-foreground">completed</p>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 container max-w-lg lg:max-w-3xl mx-auto px-4 py-6 w-full">
          {activeTab === 'today' && (
            <div className="space-y-3">
              {todaysHabits.length > 0 && (
                <div className="xl:hidden">
                  <DailySummary />
                </div>
              )}
              {todaysHabits.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-lg font-medium mb-2">No habits for today</h2>
                  <p className="text-muted-foreground mb-6">
                    Start building better habits
                  </p>
                  <Button onClick={() => setFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Habit
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {todaysHabits.map((habit, index) => (
                    <div
                      key={habit.id}
                      className={cn(
                        !isGhostMode && "animate-fade-in"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <HabitCard
                        habit={habit}
                        onEdit={handleEditHabit}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'water' && (
            <WaterTracker
              dailyGoal={waterTracker.dailyGoal}
              todayIntake={waterTracker.todayIntake}
              addWater={waterTracker.addWater}
              setDailyGoal={waterTracker.setDailyGoal}
              resetToday={waterTracker.resetToday}
              getProgress={waterTracker.getProgress}
              getWeeklyStats={waterTracker.getWeeklyStats}
            />
          )}

          {activeTab === 'calories' && <CalorieChat />}
          {/* calendar tab removed */}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>

        {/* FAB (mobile only) */}
        {activeTab === 'today' && habits.filter(h => !h.archived).length > 0 && (
          <Button
            size="lg"
            className={cn(
              "lg:hidden fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg",
              !isGhostMode && "shadow-primary/25"
            )}
            onClick={() => setFormOpen(true)}
          >
            <Plus className="h-6 w-6" />
          </Button>
        )}

        {/* Bottom Navigation (mobile only) */}
        <nav className="lg:hidden sticky bottom-0 bg-background/80 backdrop-blur-lg border-t safe-area-inset-bottom">
          <div className="container max-w-lg mx-auto">
            <div className="flex items-center justify-around py-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors",
                    activeTab === tab.id
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.icon}
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>
      </div>

      {/* Desktop right analytics panel */}
      <DesktopRightPanel />

      {/* Habit Form Dialog */}
      <HabitForm
        open={formOpen}
        onOpenChange={handleFormClose}
        editHabit={editingHabit}
      />
    </div>
  );
}
