import { useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { useStore, formatARS } from "@/lib/store";
import type { CartExtra, CartItem, Product } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ProductDialog({
  product,
  open,
  onOpenChange,
}: {
  product: Product | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const extraGroups = useStore((s) => s.extraGroups);
  const addToCart = useStore((s) => s.addToCart);

  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [selected, setSelected] = useState<Record<string, string[]>>({});

  if (!product) return null;
  const groups = extraGroups.filter((g) => product.extraGroupIds.includes(g.id));

  const reset = () => {
    setQty(1);
    setNotes("");
    setSelected({});
  };

  const toggleOpt = (groupId: string, optId: string, multi: boolean) => {
    setSelected((s) => {
      const cur = s[groupId] ?? [];
      if (multi) {
        return {
          ...s,
          [groupId]: cur.includes(optId) ? cur.filter((x) => x !== optId) : [...cur, optId],
        };
      }
      return { ...s, [groupId]: [optId] };
    });
  };

  const extras: CartExtra[] = groups.flatMap((g) =>
    (selected[g.id] ?? []).map((oid) => {
      const o = g.options.find((x) => x.id === oid)!;
      return { groupId: g.id, optionId: oid, name: o.name, price: o.price };
    })
  );

  const unit = product.price + extras.reduce((a, e) => a + e.price, 0);
  const total = unit * qty;

  const handleAdd = () => {
    const item: CartItem = {
      id: crypto.randomUUID(),
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty,
      extras,
      notes: notes.trim() || undefined,
    };
    addToCart(item);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-y-auto p-0 sm:max-w-lg">
        <div className="relative w-full shrink-0 overflow-hidden" style={{ aspectRatio: "16 / 10" }}>
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        </div>
        <div className="relative px-6 pb-6 pt-6">
          <DialogHeader>
            <DialogTitle className="font-display text-3xl">{product.name}</DialogTitle>
          </DialogHeader>
          <p className="mt-2 text-sm text-muted-foreground">{product.description}</p>

          {groups.map((g) => (
            <div key={g.id} className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-display text-lg">{g.name}</h4>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  {g.multi ? "Elige los que quieras" : "Elige uno"}
                </span>
              </div>
              <div className="grid gap-2">
                {g.options.map((o) => {
                  const isOn = (selected[g.id] ?? []).includes(o.id);
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => toggleOpt(g.id, o.id, g.multi)}
                      className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left transition ${
                        isOn
                          ? "border-gold bg-gold/10"
                          : "border-border hover:border-gold/50"
                      }`}
                    >
                      <span className="text-sm font-medium">{o.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {o.price > 0 ? `+ ${formatARS(o.price)}` : "Incluido"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="mt-6">
            <h4 className="mb-2 font-display text-lg">Notas</h4>
            <Textarea
              placeholder="Sin cebolla, sin sal, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={300}
              className="resize-none"
            />
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1 rounded-full border border-border p-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => setQty(Math.max(1, qty - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center text-sm font-semibold">{qty}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => setQty(qty + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={handleAdd}
              className="h-12 flex-1 rounded-full bg-gold text-gold-foreground hover:bg-gold/90"
            >
              Agregar · {formatARS(total)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
