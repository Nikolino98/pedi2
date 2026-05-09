import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2, ImageIcon, Lock } from "lucide-react";
import { useStore, formatARS } from "@/lib/store";
import type { Category, ExtraGroup, ExtraOption, PaymentInfo, Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · Pedi2" }] }),
  component: AdminGuard,
});

const ADMIN_CODE = "9898";

function AdminGuard() {
  const [verified, setVerified] = useState(false);
  const [code, setCode] = useState("");

  if (verified) {
    return <Admin />;
  }

  const handleComplete = (value: string) => {
    if (value === ADMIN_CODE) {
      setVerified(true);
      toast.success("Acceso concedido");
    } else {
      toast.error("Código incorrecto");
      setCode("");
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-semibold">Acceso restringido</h1>
          <p className="text-sm text-muted-foreground">
            Ingresá el código numeral para acceder al panel.
          </p>
        </div>

        <div className="flex justify-center">
          <InputOTP
            maxLength={4}
            value={code}
            onChange={setCode}
            onComplete={handleComplete}
            autoFocus
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="h-12 w-12 text-lg" />
              <InputOTPSlot index={1} className="h-12 w-12 text-lg" />
              <InputOTPSlot index={2} className="h-12 w-12 text-lg" />
              <InputOTPSlot index={3} className="h-12 w-12 text-lg" />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>
    </div>
  );
}

function Admin() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div>
        <h1 className="font-display text-4xl">Panel de administración</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestioná el menú, las adiciones y los datos de pago.
        </p>
      </div>

      <Tabs defaultValue="products" className="mt-8">
        <TabsList>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="extras">Extras</TabsTrigger>
          <TabsTrigger value="payment">Pago</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
          <ProductsTab />
        </TabsContent>
        <TabsContent value="categories" className="mt-6">
          <CategoriesTab />
        </TabsContent>
        <TabsContent value="extras" className="mt-6">
          <ExtrasTab />
        </TabsContent>
        <TabsContent value="payment" className="mt-6">
          <PaymentTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------------- Products ---------------- */

function ProductsTab() {
  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);
  const deleteProduct = useStore((s) => s.deleteProduct);
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  const empty: Product = {
    id: "",
    name: "",
    description: "",
    price: 0,
    image: "",
    categoryId: categories[0]?.id ?? "",
    extraGroupIds: [],
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button
          onClick={() => {
            setEditing(empty);
            setOpen(true);
          }}
          className="bg-gold text-gold-foreground hover:bg-gold/90"
        >
          <Plus className="mr-2 h-4 w-4" /> Nuevo producto
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => {
          const cat = categories.find((c) => c.id === p.categoryId);
          return (
            <div key={p.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              <div className="aspect-[4/3] bg-muted">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-muted-foreground">
                    <ImageIcon />
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{cat?.name}</p>
                <h3 className="font-display text-xl">{p.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-semibold text-gold">{formatARS(p.price)}</span>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditing(p);
                        setOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        deleteProduct(p.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ProductDialog product={editing} open={open} onOpenChange={setOpen} />
    </div>
  );
}

function ProductDialog({
  product,
  open,
  onOpenChange,
}: {
  product: Product | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const categories = useStore((s) => s.categories);
  const extraGroups = useStore((s) => s.extraGroups);
  const upsert = useStore((s) => s.upsertProduct);
  const uploadImage = useStore((s) => s.uploadProductImage);
  const [draft, setDraft] = useState<Product | null>(product);
  const [uploading, setUploading] = useState(false);

  // sync when prop changes
  if (product && draft?.id !== product.id) {
    setDraft(product);
  }

  if (!draft) return null;

  const handleImage = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setDraft({ ...draft, image: url });
      toast.success("Imagen subida");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!draft.name.trim() || !draft.categoryId) {
      toast.error("Nombre y categoría requeridos");
      return;
    }
    await upsert({ ...draft, id: draft.id || crypto.randomUUID() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {draft.id ? "Editar producto" : "Nuevo producto"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Imagen</Label>
            <div className="mt-2 flex items-center gap-4">
              <div className="h-24 w-24 overflow-hidden rounded-lg border border-border bg-muted">
                {draft.image ? (
                  <img src={draft.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-muted-foreground">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                )}
              </div>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleImage(e.target.files?.[0])}
                disabled={uploading}
              />
            </div>
            {uploading && <p className="mt-1 text-xs text-gold animate-pulse">Subiendo imagen...</p>}
          </div>

          <div>
            <Label>Nombre</Label>
            <Input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              maxLength={80}
              className="mt-2"
            />
          </div>
          <div>
            <Label>Descripción</Label>
            <Textarea
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              maxLength={300}
              className="mt-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Precio</Label>
              <Input
                type="number"
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Categoría</Label>
              <Select
                value={draft.categoryId}
                onValueChange={(v) => setDraft({ ...draft, categoryId: v })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Grupos de extras disponibles</Label>
            <p className="text-[10px] text-muted-foreground mt-1 mb-2">
              Mostrando extras vinculados a la categoría seleccionada.
            </p>
            <div className="mt-2 space-y-2">
              {extraGroups
                .filter((g) => !draft.categoryId || g.categoryIds?.includes(draft.categoryId))
                .map((g) => {
                  const checked = draft.extraGroupIds.includes(g.id);
                  return (
                    <label
                      key={g.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) =>
                          setDraft({
                            ...draft,
                            extraGroupIds: v
                              ? [...draft.extraGroupIds, g.id]
                              : draft.extraGroupIds.filter((x) => x !== g.id),
                          })
                        }
                      />
                      <span className="text-sm">{g.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {g.options.length} opciones
                      </span>
                    </label>
                  );
                })}
              {extraGroups.filter((g) => !draft.categoryId || g.categoryIds?.includes(draft.categoryId)).length === 0 && (
                <p className="text-sm text-muted-foreground italic text-center py-4 border border-dashed rounded-lg">
                  No hay grupos de extras vinculados a esta categoría.
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={save}
            disabled={uploading}
            className="bg-gold text-gold-foreground hover:bg-gold/90"
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Categories ---------------- */

function CategoriesTab() {
  const categories = useStore((s) => s.categories);
  const add = useStore((s) => s.addCategory);
  const update = useStore((s) => s.updateCategory);
  const remove = useStore((s) => s.deleteCategory);
  const [name, setName] = useState("");

  return (
    <div className="max-w-xl">
      <div className="flex gap-2">
        <Input
          placeholder="Nueva categoría (ej. Entradas)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
        />
        <Button
          onClick={async () => {
            if (!name.trim()) return;
            await add(name.trim());
            setName("");
          }}
          className="bg-gold text-gold-foreground hover:bg-gold/90"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ul className="mt-4 space-y-2">
        {categories.map((c) => (
          <CategoryItem key={c.id} category={c} onUpdate={update} onDelete={remove} />
        ))}
      </ul>
    </div>
  );
}

function CategoryItem({
  category,
  onUpdate,
  onDelete,
}: {
  category: Category;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [name, setName] = useState(category.name);
  const hasChanges = name !== category.name && name.trim() !== "";

  return (
    <li className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border-0 bg-transparent shadow-none focus-visible:ring-0"
      />
      {hasChanges && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onUpdate(category.id, name.trim())}
          className="text-gold"
        >
          Guardar
        </Button>
      )}
      <Button size="icon" variant="ghost" onClick={() => onDelete(category.id)}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </li>
  );
}

/* ---------------- Extras ---------------- */

function ExtrasTab() {
  const groups = useStore((s) => s.extraGroups);
  const categories = useStore((s) => s.categories);
  const upsert = useStore((s) => s.upsertExtraGroup);
  const remove = useStore((s) => s.deleteExtraGroup);
  const [filterCatId, setFilterCatId] = useState<string | "all">("all");

  const addGroup = () => {
    upsert({
      id: crypto.randomUUID(),
      name: "Nuevo grupo",
      multi: true,
      required: false,
      options: [],
      categoryIds: filterCatId !== "all" ? [filterCatId] : [],
    });
  };

  const filteredGroups = filterCatId === "all" 
    ? groups 
    : groups.filter(g => g.categoryIds?.includes(filterCatId));

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCatId("all")}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              filterCatId === "all"
                ? "bg-gold text-gold-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCatId(cat.id)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                filterCatId === cat.id
                  ? "bg-gold text-gold-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <Button onClick={addGroup} className="bg-gold text-gold-foreground hover:bg-gold/90">
          <Plus className="mr-2 h-4 w-4" /> Nuevo grupo
        </Button>
      </div>

      {filteredGroups.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredGroups.map((g) => (
            <ExtraGroupCard key={g.id} group={g} onChange={upsert} onDelete={() => remove(g.id)} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
          <p className="text-muted-foreground">No hay grupos de extras en esta categoría.</p>
          {filterCatId !== "all" && (
            <Button variant="link" onClick={addGroup} className="mt-2 text-gold">
              Crear el primero para {categories.find(c => c.id === filterCatId)?.name}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function ExtraGroupCard({
  group,
  onChange,
  onDelete,
}: {
  group: ExtraGroup;
  onChange: (g: ExtraGroup) => void;
  onDelete: () => void;
}) {
  const categories = useStore((s) => s.categories);
  const [draft, setDraft] = useState<ExtraGroup>(group);
  const [hasChanges, setHasChanges] = useState(false);

  const update = (patch: Partial<ExtraGroup>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setHasChanges(true);
  };

  const updateOpt = (id: string, patch: Partial<ExtraOption>) => {
    const newOptions = draft.options.map((o) => (o.id === id ? { ...o, ...patch } : o));
    update({ options: newOptions });
  };

  const removeOpt = (id: string) => {
    const newOptions = draft.options.filter((o) => o.id !== id);
    update({ options: newOptions });
  };

  const addOpt = () => {
    const newOptions = [
      ...draft.options,
      { id: crypto.randomUUID(), name: "Nueva opción", price: 0 },
    ];
    update({ options: newOptions });
  };

  const toggleCategory = (catId: string) => {
    const current = draft.categoryIds || [];
    const newCatIds = current.includes(catId)
      ? current.filter((id) => id !== catId)
      : [...current, catId];
    update({ categoryIds: newCatIds });
  };

  const handleSave = async () => {
    await onChange(draft);
    setHasChanges(false);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <Input
          value={draft.name}
          onChange={(e) => update({ name: e.target.value })}
          className="font-display text-lg"
        />
        <Button size="icon" variant="ghost" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
      
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Switch checked={draft.multi} onCheckedChange={(v) => update({ multi: v })} />
          Selección múltiple
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Switch checked={draft.required} onCheckedChange={(v) => update({ required: v })} />
          Obligatorio
        </label>
      </div>

      <div className="mt-4">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground">Categorías vinculadas</Label>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const active = draft.categoryIds?.includes(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${
                  active
                    ? "bg-gold text-gold-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
          {(!categories || categories.length === 0) && (
            <p className="text-xs text-muted-foreground italic">No hay categorías creadas</p>
          )}
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">
          Este grupo solo aparecerá en productos de las categorías seleccionadas.
        </p>
      </div>

      <ul className="mt-6 space-y-2">
        {draft.options.map((o) => (
          <li key={o.id} className="flex items-center gap-2">
            <Input
              value={o.name}
              onChange={(e) => updateOpt(o.id, { name: e.target.value })}
              className="flex-1"
            />
            <Input
              type="number"
              value={o.price}
              onChange={(e) => updateOpt(o.id, { price: Number(e.target.value) })}
              className="w-24"
            />
            <Button size="icon" variant="ghost" onClick={() => removeOpt(o.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={addOpt}>
          <Plus className="mr-2 h-4 w-4" /> Opción
        </Button>
        {hasChanges && (
          <Button onClick={handleSave} className="bg-gold text-gold-foreground hover:bg-gold/90">
            Guardar
          </Button>
        )}
      </div>
    </div>
  );
}

/* ---------------- Payment ---------------- */

function PaymentTab() {
  const payment = useStore((s) => s.payment);
  const update = useStore((s) => s.updatePayment);
  const [draft, setDraft] = useState<PaymentInfo>(payment);

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <Label>Alias</Label>
        <Input value={draft.alias} onChange={(e) => setDraft({ ...draft, alias: e.target.value })} className="mt-2" />
      </div>
      <div>
        <Label>CVU / CBU</Label>
        <Input value={draft.cvu} onChange={(e) => setDraft({ ...draft, cvu: e.target.value })} className="mt-2" />
      </div>
      <div>
        <Label>Titular de la cuenta</Label>
        <Input
          value={draft.accountName}
          onChange={(e) => setDraft({ ...draft, accountName: e.target.value })}
          className="mt-2"
        />
      </div>
      <div>
        <Label>WhatsApp (formato internacional, sin +)</Label>
        <Input
          value={draft.whatsapp}
          onChange={(e) => setDraft({ ...draft, whatsapp: e.target.value.replace(/\D/g, "") })}
          placeholder="5491122334455"
          className="mt-2"
        />
      </div>
      <Button
        onClick={async () => {
          await update(draft);
        }}
        className="bg-gold text-gold-foreground hover:bg-gold/90"
      >
        Guardar
      </Button>
    </div>
  );
}
