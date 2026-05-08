import { Link, useRouterState } from "@tanstack/react-router";
import { ShoppingBag, Settings, UtensilsCrossed } from "lucide-react";
import { useStore } from "@/lib/store";

export function Header() {
  const cart = useStore((s) => s.cart);
  const path = useRouterState({ select: (r) => r.location.pathname });
  const count = cart.reduce((a, i) => a + i.qty, 0);

  const linkBase =
    "text-sm tracking-wide uppercase transition-colors hover:text-gold";
  const isActive = (p: string) =>
    path === p ? "text-gold" : "text-foreground/70";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5 text-gold" />
          <span className="font-display text-2xl font-semibold tracking-tight">
            Pedi<span className="text-gold">2</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/" className={`${linkBase} ${isActive("/")}`}>
            Menú
          </Link>
          {/* <Link to="/checkout" className={`${linkBase} ${isActive("/checkout")}`}>
            Pago
          </Link> */}
        </nav>

        <Link
          to="/cart"
          className="relative flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium shadow-soft transition hover:border-gold"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Carrito</span>
          {count > 0 && (
            <span className="ml-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1.5 text-xs font-semibold text-gold-foreground">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
