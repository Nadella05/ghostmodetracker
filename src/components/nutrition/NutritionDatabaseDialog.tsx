import { useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Pencil, Trash2, Star, Archive, Download, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CustomFood, UNIT_LABELS, FOOD_CATEGORIES } from '@/types/nutrition';
import { useNutritionDb } from '@/hooks/useNutritionDb';
import {
  deleteFood, toggleArchive, toggleFavourite, exportDb, importDb,
} from '@/lib/nutritionDb';
import { toast } from 'sonner';
import { FoodFormDialog } from './FoodFormDialog';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function NutritionDatabaseDialog({ open, onOpenChange }: Props) {
  const { foods } = useNutritionDb();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState<CustomFood | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return foods
      .filter(f => showArchived ? f.archived : !f.archived)
      .filter(f => category === 'All' || f.category === category)
      .filter(f => !query || f.name.toLowerCase().includes(query) || (f.brand && f.brand.toLowerCase().includes(query)))
      .sort((a, b) => (Number(!!b.favourite) - Number(!!a.favourite)) || a.name.localeCompare(b.name));
  }, [foods, q, category, showArchived]);

  const handleExport = () => {
    const blob = new Blob([exportDb()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutrition-database-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported nutrition database');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const { added, skipped } = importDb(String(reader.result || ''), 'merge');
        toast.success(`Imported ${added} food${added === 1 ? '' : 's'}${skipped ? ` · ${skipped} skipped` : ''}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Import failed');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Nutrition Database</DialogTitle>
          </DialogHeader>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search foods…" className="pl-9 h-9" />
            </div>
            <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
            <Button size="sm" variant="outline" onClick={handleExport} title="Export">
              <Download className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} title="Import">
              <Upload className="h-4 w-4" />
            </Button>
            <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <FilterPill active={category === 'All'} onClick={() => setCategory('All')}>All</FilterPill>
            {FOOD_CATEGORIES.map(c => (
              <FilterPill key={c} active={category === c} onClick={() => setCategory(c)}>{c}</FilterPill>
            ))}
            <FilterPill active={showArchived} onClick={() => setShowArchived(v => !v)}>
              <Archive className="h-3 w-3 mr-1 inline" />{showArchived ? 'Archived' : 'Active'}
            </FilterPill>
          </div>

          <div className="flex-1 overflow-y-auto -mx-2 px-2 mt-2">
            {filtered.length === 0 ? (
              <div className="text-center py-10 text-sm text-muted-foreground">
                {foods.length === 0 ? 'No foods yet — add your first one.' : 'No foods match this filter.'}
              </div>
            ) : (
              <div className="space-y-1.5">
                {filtered.map(f => (
                  <div key={f.id} className="flex items-center gap-2 rounded-lg border bg-card p-2.5">
                    <button
                      onClick={() => toggleFavourite(f.id)}
                      className={cn(
                        'p-1 rounded transition-colors',
                        f.favourite ? 'text-amber-500' : 'text-muted-foreground hover:text-amber-500',
                      )}
                    >
                      <Star className={cn('h-4 w-4', f.favourite && 'fill-amber-400')} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-medium truncate">{f.name}</p>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{f.category}</Badge>
                        {f.brand && <span className="text-[11px] text-muted-foreground">· {f.brand}</span>}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {f.referenceQuantity} {UNIT_LABELS[f.referenceUnit]} · {f.nutrition.calories} kcal
                        · P {f.nutrition.protein}g · C {f.nutrition.carbs}g · F {f.nutrition.fat}g
                      </p>
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditing(f); setFormOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toggleArchive(f.id)} title={f.archived ? 'Unarchive' : 'Archive'}>
                      <Archive className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon" variant="ghost"
                      className="h-7 w-7 hover:text-destructive"
                      onClick={() => {
                        if (confirm(`Delete "${f.name}"? This cannot be undone.`)) {
                          deleteFood(f.id);
                          toast.success('Food deleted');
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <FoodFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />
    </>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-2.5 py-1 rounded-full text-[11px] border transition-colors',
        active ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted',
      )}
    >
      {children}
    </button>
  );
}
