import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomFood, RefUnit, REF_UNITS, UNIT_LABELS, FOOD_CATEGORIES, ZERO_NUTRITION } from '@/types/nutrition';
import { addFood, updateFood, isDuplicateName } from '@/lib/nutritionDb';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing?: CustomFood | null;
  onSaved?: (food: CustomFood) => void;
}

export function FoodFormDialog({ open, onOpenChange, editing, onSaved }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('Custom');
  const [brand, setBrand] = useState('');
  const [refQty, setRefQty] = useState('');
  const [refUnit, setRefUnit] = useState<RefUnit>('g');
  const [nutrition, setNutrition] = useState({ ...ZERO_NUTRITION });
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) {
      if (editing) {
        setName(editing.name);
        setCategory(editing.category);
        setBrand(editing.brand ?? '');
        setRefQty(String(editing.referenceQuantity));
        setRefUnit(editing.referenceUnit);
        setNutrition({ ...editing.nutrition });
        setNotes(editing.notes ?? '');
      } else {
        setName(''); setCategory('Custom'); setBrand('');
        setRefQty(''); setRefUnit('g');
        setNutrition({ ...ZERO_NUTRITION }); setNotes('');
      }
    }
  }, [open, editing]);

  const setNutrField = (k: keyof typeof nutrition, v: string) => {
    const n = parseFloat(v);
    setNutrition(prev => ({ ...prev, [k]: isNaN(n) || n < 0 ? 0 : n }));
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return toast.error('Food name is required');
    const qty = parseFloat(refQty);
    if (!qty || qty <= 0) return toast.error('Reference quantity must be positive');
    if (nutrition.calories < 0) return toast.error('Calories cannot be negative');
    if (isDuplicateName(trimmedName, editing?.id)) return toast.error('A food with this name already exists');

    try {
      const payload = {
        name: trimmedName,
        category,
        brand: brand.trim() || undefined,
        referenceQuantity: qty,
        referenceUnit: refUnit,
        nutrition,
        notes: notes.trim() || undefined,
      };
      const saved = editing ? updateFood(editing.id, payload) : addFood(payload);
      if (saved) {
        toast.success(editing ? 'Food updated' : 'Food added');
        onSaved?.(saved);
        onOpenChange(false);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Food' : 'Add New Food'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Food Name *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Paneer" maxLength={120} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FOOD_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Brand (optional)</Label>
              <Input value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. Amul" maxLength={80} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Reference Quantity *</Label>
              <Input type="number" min={0} step="any" value={refQty} onChange={e => setRefQty(e.target.value)} placeholder="40" />
            </div>
            <div className="space-y-1.5">
              <Label>Reference Unit</Label>
              <Select value={refUnit} onValueChange={(v) => setRefUnit(v as RefUnit)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REF_UNITS.map(u => <SelectItem key={u} value={u}>{UNIT_LABELS[u]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border p-3 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Nutrition per {refQty || '?'} {UNIT_LABELS[refUnit]}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <NField label="Calories (kcal) *" value={nutrition.calories} onChange={v => setNutrField('calories', v)} />
              <NField label="Protein (g)" value={nutrition.protein} onChange={v => setNutrField('protein', v)} />
              <NField label="Carbs (g)" value={nutrition.carbs} onChange={v => setNutrField('carbs', v)} />
              <NField label="Fat (g)" value={nutrition.fat} onChange={v => setNutrField('fat', v)} />
              <NField label="Fiber (g)" value={nutrition.fiber} onChange={v => setNutrField('fiber', v)} />
              <NField label="Sugar (g)" value={nutrition.sugar} onChange={v => setNutrField('sugar', v)} />
              <NField label="Sodium (mg)" value={nutrition.sodium} onChange={v => setNutrField('sodium', v)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any notes…" maxLength={500} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Food</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NField({ label, value, onChange }: { label: string; value: number; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      <Input type="number" min={0} step="any" value={value} onChange={e => onChange(e.target.value)} className="h-8" />
    </div>
  );
}
