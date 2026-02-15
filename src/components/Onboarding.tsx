import { useState } from 'react';
import { Sparkles, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeColor, THEME_COLORS } from '@/types/habit';

interface OnboardingProps {
  onComplete: (name: string, themeColor: ThemeColor) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState<ThemeColor>('indigo');
  const [step, setStep] = useState<'name' | 'color'>('name');

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setStep('color');
    }
  };

  const handleComplete = () => {
    onComplete(name.trim(), selectedColor);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Welcome to Habit Tracker</h1>
          <p className="text-muted-foreground mt-2">
            Build better habits, one day at a time
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border bg-card p-6 shadow-lg">
          {step === 'name' ? (
            <form onSubmit={handleNameSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  What should we call you?
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="h-12 text-lg"
                  autoFocus
                  autoComplete="off"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base"
                disabled={!name.trim()}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Choose your accent color
                </label>
                <p className="text-sm text-muted-foreground">
                  This will personalize your app experience
                </p>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {(Object.keys(THEME_COLORS) as ThemeColor[]).map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "relative aspect-square rounded-xl transition-all hover:scale-105",
                      selectedColor === color && "ring-2 ring-offset-2 ring-offset-background"
                    )}
                    style={{ 
                      backgroundColor: THEME_COLORS[color].hex,
                      '--tw-ring-color': THEME_COLORS[color].hex,
                    } as React.CSSProperties}
                  >
                    {selectedColor === color && (
                      <Check className="absolute inset-0 m-auto h-5 w-5 text-white" />
                    )}
                    <span className="sr-only">{THEME_COLORS[color].label}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => setStep('name')}
                >
                  Back
                </Button>
                <Button 
                  className="flex-1 h-12"
                  onClick={handleComplete}
                >
                  Enter App
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Your data stays on your device. Privacy-first.
        </p>
      </div>
    </div>
  );
}
