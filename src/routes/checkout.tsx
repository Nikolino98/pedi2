import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Check, MessageCircle } from "lucide-react";
import { cartTotal, formatARS, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Pago · Pedi2" }] }),
  component: Checkout,
});

function Checkout() {
  const cart = useStore((s) => s.cart);
  const payment = useStore((s) => s.payment);
  const clearCart = useStore((s) => s.clearCart);
  const navigate = useNavigate();
  const total = cartTotal(cart);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl">No hay nada para pagar</h1>
        <Link to="/" className="mt-6 inline-block text-gold hover:underline">
          Ir al menú →
        </Link>
      </div>
    );
  }

  const copy = async (val: string, key: string) => {
    await navigator.clipboard.writeText(val);
    setCopied(key);
    toast.success("Copiado al portapapeles");
    setTimeout(() => setCopied(null), 1500);
  };

  const orderSummary = cart
    .map((i) => `• ${i.qty}x ${i.name}${i.extras.length ? ` (${i.extras.map((e) => e.name).join(", ")})` : ""}`)
    .join("\n");

  const message = encodeURIComponent(
    `Hola! Hice una transferencia por ${formatARS(total)}.\n\n` +
      `Nombre: ${name || "—"}\n\nPedido:\n${orderSummary}\n\nAdjunto el comprobante 📎`
  );
  const wa = `https://wa.me/${payment.whatsapp}?text=${message}`;

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-6 py-12 lg:grid-cols-[1fr_1fr]">
      <div>
        <h1 className="font-display text-4xl">Pago por transferencia</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Realizá la transferencia y enviá el comprobante por WhatsApp para confirmar tu pedido.
        </p>

        <div className="mt-8 space-y-4">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              placeholder="Tu nombre"
              className="mt-2"
            />
          </div>
          {/* <div>
            <Label htmlFor="addr">Dirección de entrega</Label>
            <Input
              id="addr"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              maxLength={200}
              placeholder="Calle, número, piso..."
              className="mt-2"
            />
          </div> */}
        </div>
      </div>

      <aside className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl">Datos bancarios</h2>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Total</span>
        </div>
        <p className="mt-1 font-display text-4xl text-gold">{formatARS(total)}</p>

        <div className="mt-6 space-y-3">
          <CopyRow label="Alias" value={payment.alias} onCopy={(v) => copy(v, "alias")} copied={copied === "alias"} />
          <CopyRow label="CVU / CBU" value={payment.cvu} onCopy={(v) => copy(v, "cvu")} copied={copied === "cvu"} />
          <CopyRow label="Titular" value={payment.accountName} onCopy={(v) => copy(v, "name")} copied={copied === "name"} />
          <CopyRow label="Monto" value={String(total)} onCopy={(v) => copy(v, "amt")} copied={copied === "amt"} />
        </div>

        <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-6 block">
          <Button
            className="h-12 w-full rounded-full bg-gold text-gold-foreground hover:bg-gold/90"
            onClick={() => {
              setTimeout(() => {
                clearCart();
                navigate({ to: "/" });
              }, 1000);
            }}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Enviar comprobante por WhatsApp
          </Button>
        </a>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Al enviar el comprobante, tu pedido será confirmado.
        </p>
      </aside>
    </div>
  );
}

function CopyRow({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  onCopy: (v: string) => void;
  copied: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="truncate font-mono text-sm">{value}</p>
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 shrink-0"
        onClick={() => onCopy(value)}
      >
        {copied ? <Check className="h-4 w-4 text-gold" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}
