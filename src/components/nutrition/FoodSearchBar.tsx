import { useMemo, useState } from 'react';
import { Search, Star, Clock, Plus, Database, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CustomFood, UNIT_LABELS } from '@/types/nutrition';
import { useNutritionDb } from '@/hooks/useNutritionDb';
import { searchFoods, getFavourites, getRecents } from '@/lib/nutritionDb';

interface Props {
  onSelect: (food: CustomFood) => void;
  onAddNew: (prefillName?: string) => void;
  onManage: () => void;
}

export function FoodSearchBar({ onSelect, onAddNew, onManage }: Props) {
  useNutritionDb(); // subscribe
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => searchFoods(q).slice(0, 8), [q]);
  const favs = useMemo(() => getFavourites().slice(0, 8), []);
  const recents = useMemo(() => getRecents(), []);

  const showEmpty = open && q.trim() === '' && favs.length === 0 && recents.length === 0;

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={q}
            onChange={e => setQ(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="Search your foods…"
            className="pl-9 pr-9"
          />
          {q && (
            <button
              onClick={() => setQ('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Button variant="outline" size="icon" onClick={onManage} title="Manage foods">
          <Database className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => onAddNew()} title="Add new food">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-1.5 z-20 rounded-xl border bg-popover shadow-lg max-h-80 overflow-y-auto">
            {q.trim() === '' && favs.length > 0 && (
              <Section icon={<Star className="h-3 w-3 fill-amber-400 text-amber-500" />} label="Favourites">
                {favs.map(f => (
                  <Row key={f.id} food={f} onClick={() => { onSelect(f); setOpen(false); setQ(''); }} />
                ))}
              </Section>
            )}
            {q.trim() === '' && recents.length > 0 && (
              <Section icon={<Clock className="h-3 w-3 text-muted-foreground" />} label="Recent">
                {recents.map(f => (
                  <Row key={f.id} food={f} onClick={() => { onSelect(f); setOpen(false); setQ(''); }} />
                ))}
              </Section>
            )}
            {q.trim() !== '' && (
              <>
                {matches.length > 0 ? (
                  <Section label={`${matches.length} match${matches.length === 1 ? '' : 'es'}`}>
                    {matches.map(f => (
                      <Row key={f.id} food={f} onClick={() => { onSelect(f); setOpen(false); setQ(''); }} />
                    ))}
                  </Section>
                ) : (
                  <div className="p-3 text-center space-y-2">
                    <p className="text-xs text-muted-foreground">No matches for "{q}"</p>
                    <Button size="sm" variant="outline" onClick={() => { onAddNew(q); setOpen(false); }}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add "{q}" as new food
                    </Button>
                  </div>
                )}
              </>
            )}
            {showEmpty && (
              <div className="p-4 text-center space-y-2">
                <p className="text-xs text-muted-foreground">Your nutrition database is empty.</p>
                <Button size="sm" variant="outline" onClick={() => { onAddNew(); setOpen(false); }}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add your first food
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Section({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="py-1">
      <div className="px-3 py-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}{label}
      </div>
      {children}
    </div>
  );
}

function Row({ food, onClick }: { food: CustomFood; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-muted transition-colors',
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium truncate">{food.name}</p>
          {food.favourite && <Star className="h-3 w-3 fill-amber-400 text-amber-500 shrink-0" />}
        </div>
        <p className="text-[10px] text-muted-foreground truncate">
          {food.category}{food.brand ? ` · ${food.brand}` : ''} · {food.referenceQuantity} {UNIT_LABELS[food.referenceUnit]} · {food.nutrition.calories} kcal
        </p>
      </div>
    </button>
  );
}
