import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore, formatARS } from "@/lib/store";
import type { Product } from "@/lib/types";
import { ProductDialog } from "@/components/ProductDialog";
import { Plus, Sparkles } from "lucide-react";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pedi2 — Gourmet Delivery" },
      { name: "description", content: "Pedí comida gourmet con un toque elegante. Hamburguesas, pizzas, postres y más." },
      { property: "og:title", content: "Pedi2 — Gourmet Delivery" },
      { property: "og:description", content: "Pedí comida gourmet con un toque elegante." },
    ],
  }),
  component: Index,
});

function Index() {
  const categories = useStore((s) => s.categories);
  const products = useStore((s) => s.products);
  const [activeCat, setActiveCat] = useState<string>("all");
  const [selected, setSelected] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () => (activeCat === "all" ? products : products.filter((p) => p.categoryId === activeCat)),
    [products, activeCat]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of filtered) {
      if (!map.has(p.categoryId)) map.set(p.categoryId, []);
      map.get(p.categoryId)!.push(p);
    }
    return map;
  }, [filtered]);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="h-full w-full object-cover" width={1536} height={1024} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-card/40 px-3 py-1 text-xs uppercase tracking-widest text-gold backdrop-blur">
            <Sparkles className="h-3 w-3" /> Nuevo · Selección de la casa
          </div>
          <h1 className="mt-6 max-w-2xl font-display text-5xl font-medium leading-[1.05] md:text-7xl">
            Sabores de autor, <span className="italic text-gold">a tu puerta.</span>
          </h1>
          <p className="mt-4 max-w-md text-base text-muted-foreground">
            Cocina cuidada, ingredientes nobles y un servicio elegante. Elegí, personalizá y disfrutá.
          </p>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="sticky top-16 z-30 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6 py-4">
          <CatChip active={activeCat === "all"} onClick={() => setActiveCat("all")}>
            Todo
          </CatChip>
          {categories.map((c) => (
            <CatChip key={c.id} active={activeCat === c.id} onClick={() => setActiveCat(c.id)}>
              {c.name}
            </CatChip>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        {[...grouped.entries()].map(([catId, items]) => {
          const cat = categories.find((c) => c.id === catId);
          return (
            <div key={catId} className="mb-16">
              <div className="mb-6 flex items-end justify-between">
                <h2 className="font-display text-3xl md:text-4xl">{cat?.name}</h2>
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  {items.length} {items.length === 1 ? "plato" : "platos"}
                </span>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onClick={() => {
                      setSelected(p);
                      setOpen(true);
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <ProductDialog product={selected} open={open} onOpenChange={setOpen} />
    </div>
  );
}

function CatChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition ${
        active
          ? "border-gold bg-gold text-gold-foreground"
          : "border-border bg-card hover:border-gold/60"
      }`}
    >
      {children}
    </button>
  );
}

function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group overflow-hidden rounded-2xl border border-border bg-card text-left shadow-soft transition hover:-translate-y-1 hover:border-gold/60 hover:shadow-elegant"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
      </div>
      <div className="flex items-start justify-between gap-4 p-5">
        <div>
          <h3 className="font-display text-xl">{product.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
          <p className="mt-3 text-base font-semibold text-gold">{formatARS(product.price)}</p>
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-foreground text-background transition group-hover:bg-gold group-hover:text-gold-foreground">
          <Plus className="h-5 w-5" />
        </div>
      </div>
    </button>
  );
}
