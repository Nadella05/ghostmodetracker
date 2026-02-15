import { Archive, RotateCcw, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHabitContext } from '@/contexts/HabitContext';
import { Button } from '@/components/ui/button';
import { CATEGORY_LABELS } from '@/types/habit';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ArchivedHabitsViewProps {
  onBack: () => void;
}

export function ArchivedHabitsView({ onBack }: ArchivedHabitsViewProps) {
  const { habits, updateHabit, deleteHabit, isGhostMode } = useHabitContext();
  
  const archivedHabits = habits.filter(h => h.archived);

  const handleRestore = (habitId: string) => {
    updateHabit(habitId, { archived: false });
  };

  const handlePermanentDelete = (habitId: string) => {
    deleteHabit(habitId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <h2 className="text-lg font-semibold">Archived Habits</h2>
      </div>

      {archivedHabits.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <Archive className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No archived habits</h3>
          <p className="text-muted-foreground">
            Archived habits will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {archivedHabits.map((habit) => (
            <div 
              key={habit.id}
              className="flex items-center gap-4 rounded-lg border bg-card p-4"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{habit.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {CATEGORY_LABELS[habit.category]} • {habit.completedDates.length} completions
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestore(habit.id)}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Restore
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete "{habit.name}" and all its history. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handlePermanentDelete(habit.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Forever
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
