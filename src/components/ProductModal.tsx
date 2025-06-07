import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCart, CartExtra } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

interface Extra {
  id: string;
  name: string;
  price: number;
  max_selections: number;
  required: boolean;
  options: ExtraOption[];
}

interface ExtraOption {
  id: string;
  name: string;
  price: number;
}

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<{[extraId: string]: string[]}>({});
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [extras, setExtras] = useState<Extra[]>([]);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && product.category) {
      fetchExtras();
    }
    if (isOpen) {
      setQuantity(1);
      setSelectedExtras({});
      setSpecialInstructions('');
    }
  }, [isOpen, product.category]);

  const fetchExtras = async () => {
    setLoading(true);
    
    try {
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', product.category)
        .single();

      if (categoryError || !categoryData) {
        console.error('Error fetching category:', categoryError);
        setExtras([]);
        setLoading(false);
        return;
      }

      const { data: extrasData, error: extrasError } = await supabase
        .from('extras')
        .select(`
          id,
          name,
          price,
          max_selections,
          required,
          extra_options (
            id,
            name,
            price,
            active
          )
        `)
        .eq('category_id', categoryData.id)
        .eq('active', true);

      if (extrasError) {
        console.error('Error fetching extras:', extrasError);
        setExtras([]);
        setLoading(false);
        return;
      }

      const transformedExtras: Extra[] = (extrasData || []).map(extra => ({
        id: extra.id,
        name: extra.name,
        price: extra.price,
        max_selections: extra.max_selections,
        required: extra.required,
        options: (extra.extra_options || [])
          .filter(option => option.active)
          .map(option => ({
            id: option.id,
            name: option.name,
            price: option.price
          }))
      }));

      setExtras(transformedExtras);
    } catch (error) {
      console.error('Error in fetchExtras:', error);
      setExtras([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExtraChange = (extraId: string, optionId: string, checked: boolean) => {
    setSelectedExtras(prev => {
      const current = prev[extraId] || [];
      const extra = extras.find(e => e.id === extraId);
      
      if (!extra) return prev;

      if (checked) {
        if (current.length >= extra.max_selections) {
          toast({
            title: "Límite alcanzado",
            description: `Solo puedes seleccionar ${extra.max_selections} opción(es) para ${extra.name}`,
            variant: "destructive"
          });
          return prev;
        }
        return { ...prev, [extraId]: [...current, optionId] };
      } else {
        return { ...prev, [extraId]: current.filter(id => id !== optionId) };
      }
    });
  };

  const calculateTotal = () => {
    let total = product.price * quantity;
    
    extras.forEach(extra => {
      const selectedOptions = selectedExtras[extra.id] || [];
      selectedOptions.forEach(optionId => {
        const option = extra.options.find(opt => opt.id === optionId);
        if (option) {
          total += option.price * quantity;
        }
      });
    });
    
    return total;
  };

  const handleAddToCart = () => {
    const missingRequiredExtras = extras.filter(extra => 
      extra.required && (!selectedExtras[extra.id] || selectedExtras[extra.id].length === 0)
    );

    if (missingRequiredExtras.length > 0) {
      toast({
        title: "Extras requeridos",
        description: `Por favor selecciona: ${missingRequiredExtras.map(e => e.name).join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    const cartExtras: CartExtra[] = extras.reduce((acc, extra) => {
      const selectedOptions = selectedExtras[extra.id] || [];
      selectedOptions.forEach(optionId => {
        const option = extra.options.find(opt => opt.id === optionId);
        if (option) {
          acc.push({
            id: option.id,
            name: `${extra.name}: ${option.name}`,
            price: option.price
          });
        }
      });
      return acc;
    }, [] as CartExtra[]);

    addToCart({
      ...product,
      quantity,
      extras: cartExtras,
      specialInstructions,
      totalPrice: calculateTotal()
    });

    toast({
      title: "¡Agregado al carrito!",
      description: `${product.name} se ha agregado a tu carrito`,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <img
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-48 object-cover rounded-lg"
          />
          
          <p className="text-gray-600">{product.description}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-restaurant-orange">
              ${product.price}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Label>Cantidad:</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-restaurant-orange mx-auto"></div>
              <p className="mt-2 text-gray-500">Cargando extras...</p>
            </div>
          ) : extras.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Personaliza tu pedido</h3>
              {extras.map(extra => (
                <div key={extra.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="font-medium">{extra.name}</h4>
                    {extra.required && (
                      <Badge variant="destructive" className="text-xs">
                        Obligatorio
                      </Badge>
                    )}
                    <span className="text-sm text-gray-500">
                      (Máx. {extra.max_selections})
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {extra.options.map(option => (
                      <div key={option.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`${extra.id}-${option.id}`}
                            checked={(selectedExtras[extra.id] || []).includes(option.id)}
                            onCheckedChange={(checked) => 
                              handleExtraChange(extra.id, option.id, checked as boolean)
                            }
                          />
                          <Label 
                            htmlFor={`${extra.id}-${option.id}`}
                            className="text-sm"
                          >
                            {option.name}
                          </Label>
                        </div>
                        {option.price > 0 && (
                          <span className="text-sm font-medium text-restaurant-orange">
                            +${option.price}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="instructions">Instrucciones especiales (opcional):</Label>
            <Textarea
              id="instructions"
              placeholder="Ej: Sin cebolla, extra salsa..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="border-t pt-4 space-y-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total:</span>
              <span className="text-restaurant-orange">${calculateTotal()}</span>
            </div>
            
            <Button
              onClick={handleAddToCart}
              className="w-full bg-restaurant-orange hover:bg-restaurant-orange-dark text-white"
              size="lg"
            >
              Agregar al carrito - ${calculateTotal()}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
