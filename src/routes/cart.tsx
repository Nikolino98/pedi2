import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { cartItemTotal, cartTotal, formatARS, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Tu carrito · Pedi2" }] }),
  component: CartPage,
});

function CartPage() {
  const cart = useStore((s) => s.cart);
  const updateQty = useStore((s) => s.updateCartQty);
  const remove = useStore((s) => s.removeFromCart);
  const total = cartTotal(cart);

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-6 font-display text-4xl">Tu carrito está vacío</h1>
        <p className="mt-2 text-muted-foreground">Volvé al menú y armá tu pedido.</p>
        <Link
          to="/"
          className="mt-8 inline-flex h-12 items-center rounded-full bg-gold px-8 text-sm font-medium text-gold-foreground hover:bg-gold/90"
        >
          Ver el menú
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[1fr_380px]">
      <div>
        <h1 className="font-display text-4xl">Tu pedido</h1>
        <p className="mt-1 text-sm text-muted-foreground">Revisá los detalles antes de pagar.</p>
        <ul className="mt-8 space-y-4">
          {cart.map((item) => (
            <li
              key={item.id}
              className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft"
            >
              <img src={item.image} alt={item.name} className="h-24 w-24 rounded-xl object-cover" />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="font-display text-lg">{item.name}</h3>
                  <button
                    onClick={() => remove(item.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {item.extras.length > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.extras.map((e) => e.name).join(" · ")}
                  </p>
                )}
                {item.notes && (
                  <p className="mt-1 text-xs italic text-muted-foreground">"{item.notes}"</p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 rounded-full border border-border p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full"
                      onClick={() => updateQty(item.id, item.qty - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full"
                      onClick={() => updateQty(item.id, item.qty + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="font-semibold text-gold">
                    {formatARS(cartItemTotal(item))}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-elegant lg:sticky lg:top-24">
        <h2 className="font-display text-2xl">Resumen</h2>
        <div className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatARS(total)}</span>
          </div>
          {/* <div className="flex justify-between text-muted-foreground">
            <span>Retiro</span>
            <span>A confirmar</span>
          </div> */}
        </div>
        <div className="mt-4 flex justify-between border-t border-border pt-4 text-lg font-semibold">
          <span>Total</span>
          <span className="text-gold">{formatARS(total)}</span>
        </div>
        <Link
          to="/checkout"
          className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-gold text-sm font-medium text-gold-foreground hover:bg-gold/90"
        >
          Continuar al pago
        </Link>
      </aside>
    </div>
  );
}
