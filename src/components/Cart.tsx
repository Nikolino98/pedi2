
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button as ShadcnButton } from '@/components/ui/button';
import { Badge as ShadcnBadge } from '@/components/ui/badge';
import { Button, Card, CardBody, Chip, Divider } from '@nextui-org/react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import Checkout from './Checkout';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { items, removeFromCart, updateQuantity, getTotalPrice } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  if (showCheckout) {
    return (
      <Checkout
        isOpen={isOpen}
        onClose={() => {
          setShowCheckout(false);
          onClose();
        }}
        onBack={() => setShowCheckout(false)}
      />
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-gradient-to-b from-white to-restaurant-warm">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-xl text-restaurant-orange-dark flex items-center gap-2">
            <span className="text-2xl">🛒</span>
            Tu Carrito ({items.length} productos)
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          {items.length === 0 ? (
            <Card className="shadow-sm">
              <CardBody className="text-center py-12">
                <div className="text-6xl mb-4">🍽️</div>
                <p className="text-gray-500 mb-2 text-lg">Tu carrito está vacío</p>
                <p className="text-sm text-gray-400">¡Agrega algunos productos deliciosos!</p>
              </CardBody>
            </Card>
          ) : (
            <>
              <div className="space-y-3">
                {items.map((item) => (
                  <Card key={item.id} className="shadow-sm hover:shadow-md transition-shadow">
                    <CardBody className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-gray-800 text-lg">{item.name}</h4>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="danger"
                          onClick={() => removeFromCart(item.id)}
                          className="min-w-8 h-8"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>

                      {item.extras && item.extras.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-600 mb-2 font-medium">Extras:</p>
                          <div className="flex flex-wrap gap-1">
                            {item.extras.map((extra) => (
                              <Chip 
                                key={extra.id} 
                                size="sm" 
                                variant="flat"
                                color="secondary"
                                className="text-xs"
                              >
                                {extra.name} (+${extra.price})
                              </Chip>
                            ))}
                          </div>
                        </div>
                      )}

                      {item.specialInstructions && (
                        <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600">
                            <strong>Instrucciones:</strong> {item.specialInstructions}
                          </p>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="bordered"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="min-w-8 h-8"
                          >
                            <Minus size={14} />
                          </Button>
                          <span className="text-sm font-semibold w-8 text-center bg-gray-100 py-1 px-2 rounded">
                            {item.quantity}
                          </span>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="bordered"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="min-w-8 h-8"
                          >
                            <Plus size={14} />
                          </Button>
                        </div>
                        <span className="font-bold text-restaurant-orange text-lg">
                          ${item.totalPrice}
                        </span>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>

              <Divider className="my-6" />

              <Card className="shadow-lg bg-gradient-to-r from-restaurant-orange to-restaurant-orange-dark text-white">
                <CardBody className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-3xl font-bold">
                      ${getTotalPrice()}
                    </span>
                  </div>

                  <Button
                    onClick={() => setShowCheckout(true)}
                    className="w-full bg-white text-restaurant-orange hover:bg-gray-50 font-semibold text-lg h-12"
                    size="lg"
                  >
                    Continuar con el pedido 🚀
                  </Button>
                </CardBody>
              </Card>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Cart;
