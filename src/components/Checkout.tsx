
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ isOpen, onClose, onBack }) => {
  const { items, clearCart, getTotalPrice } = useCart();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    deliveryMethod: 'pickup', // 'pickup' or 'delivery'
    paymentMethod: 'cash', // 'cash' or 'transfer'
    additionalNotes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateWhatsAppMessage = () => {
    let message = "🍽️ *NUEVO PEDIDO - Pedi2*\n\n";
    
    // Customer info
    message += `👤 *Cliente:* ${formData.name}\n`;
    message += `📱 *Teléfono:* ${formData.phone}\n`;
    if (formData.email) message += `📧 *Email:* ${formData.email}\n`;
    
    // Delivery info
    message += `\n🚚 *Entrega:* ${formData.deliveryMethod === 'pickup' ? 'Retiro en local' : 'Envío a domicilio'}\n`;
    if (formData.deliveryMethod === 'delivery' && formData.address) {
      message += `📍 *Dirección:* ${formData.address}\n`;
    }
    
    // Payment info
    message += `💳 *Pago:* ${formData.paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia bancaria'}\n`;
    
    // Order details
    message += "\n📋 *PEDIDO:*\n";
    items.forEach((item, index) => {
      message += `\n${index + 1}. *${item.name}* (x${item.quantity})\n`;
      if (item.extras && item.extras.length > 0) {
        message += `   Extras: ${item.extras.map(e => e.name).join(', ')}\n`;
      }
      if (item.specialInstructions) {
        message += `   Instrucciones: ${item.specialInstructions}\n`;
      }
      message += `   Subtotal: $${item.totalPrice}\n`;
    });
    
    message += `\n💰 *TOTAL: $${getTotalPrice()}*\n`;
    
    if (formData.paymentMethod === 'transfer') {
      message += "\n🏦 *Datos para transferencia:*\n";
      message += "Alias: PEDI2.EXPRESS\n";
      message += "⚠️ *Por favor envía el comprobante de pago*\n";
    }
    
    if (formData.additionalNotes) {
      message += `\n📝 *Notas adicionales:* ${formData.additionalNotes}\n`;
    }
    
    message += "\n¡Gracias por tu pedido! 🙏";
    
    return encodeURIComponent(message);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa nombre y teléfono",
        variant: "destructive"
      });
      return;
    }

    if (formData.deliveryMethod === 'delivery' && !formData.address) {
      toast({
        title: "Dirección requerida",
        description: "Por favor ingresa la dirección de entrega",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const whatsappMessage = generateWhatsAppMessage();
      const phoneNumber = "5493517716373"; // Reemplazar con el número real del negocio
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`;
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      window.open(whatsappUrl, '_blank');
      
      toast({
        title: "Pedido enviado",
        description: "Tu pedido ha sido enviado por WhatsApp",
      });
      
      clearCart();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al enviar el pedido",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-1">
              ←
            </Button>
            <SheetTitle className="text-xl text-restaurant-orange-dark">
              Finalizar Pedido
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="font-semibold mb-3">Información de contacto</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Nombre completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Tu número de teléfono"
                />
              </div>
              <div>
                <Label htmlFor="email">Email (opcional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="tu@email.com"
                />
              </div>
            </div>
          </div>

          {/* Delivery Method */}
          <div>
            <h3 className="font-semibold mb-3">Método de entrega</h3>
            <RadioGroup
              value={formData.deliveryMethod}
              onValueChange={(value) => handleInputChange('deliveryMethod', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pickup" id="pickup" />
                <Label htmlFor="pickup">🏪 Retiro en local</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="delivery" id="delivery" />
                <Label htmlFor="delivery">🛵 Envío a domicilio</Label>
              </div>
            </RadioGroup>
            
            {formData.deliveryMethod === 'delivery' && (
              <div className="mt-3">
                <Label htmlFor="address">Dirección de entrega *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Calle, número, piso, depto"
                />
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="font-semibold mb-3">Método de pago</h3>
            <RadioGroup
              value={formData.paymentMethod}
              onValueChange={(value) => handleInputChange('paymentMethod', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash">💵 Efectivo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="transfer" id="transfer" />
                <Label htmlFor="transfer">🏦 Transferencia bancaria</Label>
              </div>
            </RadioGroup>
            
            {formData.paymentMethod === 'transfer' && (
              <div className="mt-3 p-3 bg-restaurant-warm rounded-lg">
                <p className="text-sm text-restaurant-orange-dark font-semibold">
                  📝 Datos para transferencia:
                </p>
                <p className="text-sm">Alias: <strong>PEDI2.EXPRESS</strong></p>
                <p className="text-xs text-gray-600 mt-1">
                  *Recuerda enviar el comprobante de pago
                </p>
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <Label htmlFor="notes">Notas adicionales (opcional)</Label>
            <Textarea
              id="notes"
              value={formData.additionalNotes}
              onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
              placeholder="Comentarios sobre el pedido, timbre, etc."
            />
          </div>

          {/* Order Summary */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Resumen del pedido</h3>
            <div className="space-y-1 text-sm">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.name} x{item.quantity}</span>
                  <span>${item.totalPrice}</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-2 pt-2 flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span className="text-restaurant-orange">${getTotalPrice()}</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-restaurant-orange hover:bg-restaurant-orange-dark text-white"
          >
            {isSubmitting ? 'Enviando...' : '📱 Enviar pedido por WhatsApp'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Checkout;
