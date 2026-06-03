import { useState } from 'react';
import { Activity } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useHabitContext } from '@/contexts/HabitContext';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { DEFAULT_HEALTH_PROFILE, ACTIVITY_LABELS, GOAL_LABELS, ActivityLevel, WeightGoal } from '@/lib/nutritionTargets';

export function HealthProfileSection() {
  const { profile, updateProfile } = useHabitContext();
  const [weight, setWeight] = useState(String(profile.weightKg ?? DEFAULT_HEALTH_PROFILE.weightKg));
  const [height, setHeight] = useState(String(profile.heightCm ?? DEFAULT_HEALTH_PROFILE.heightCm));
  const [age, setAge] = useState(String(profile.age ?? DEFAULT_HEALTH_PROFILE.age));
  const gender = profile.gender ?? DEFAULT_HEALTH_PROFILE.gender;
  const activity = profile.activityLevel ?? DEFAULT_HEALTH_PROFILE.activityLevel;
  const goal = profile.weightGoal ?? DEFAULT_HEALTH_PROFILE.weightGoal;

  const save = () => {
    const w = Math.max(20, Math.min(500, parseFloat(weight) || 0));
    const h = Math.max(80, Math.min(260, parseFloat(height) || 0));
    const a = Math.max(5, Math.min(120, parseInt(age) || 0));
    updateProfile({ weightKg: w, heightCm: h, age: a });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        <Activity className="h-4 w-4" /> Health Profile
      </h3>
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[11px] text-muted-foreground">Weight (kg)</label>
            <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} onBlur={save} />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground">Height (cm)</label>
            <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} onBlur={save} />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground">Age</label>
            <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} onBlur={save} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label className="text-[11px] text-muted-foreground">Gender</label>
            <Select value={gender} onValueChange={(v) => updateProfile({ gender: v as 'male' | 'female' | 'other' })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground">Activity</label>
            <Select value={activity} onValueChange={(v) => updateProfile({ activityLevel: v as ActivityLevel })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map(k => (
                  <SelectItem key={k} value={k}>{ACTIVITY_LABELS[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground">Goal</label>
            <Select value={goal} onValueChange={(v) => updateProfile({ weightGoal: v as WeightGoal })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(GOAL_LABELS) as WeightGoal[]).map(k => (
                  <SelectItem key={k} value={k}>{GOAL_LABELS[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button size="sm" variant="secondary" className="w-full" onClick={save}>Save profile</Button>
      </div>
    </div>
  );
}
