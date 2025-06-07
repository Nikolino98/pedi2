
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProductModal from './ProductModal';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  available: boolean;
  is_promotion: boolean;
  category: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Transform product for cart context
  const cartProduct = {
    ...product,
    image: product.image_url // Add the missing image property for cart context
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-fade-in">
        <div className="relative">
          <img
            src={product.image_url || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
          {product.is_promotion && (
            <Badge className="absolute top-2 left-2 bg-restaurant-red text-white animate-pulse">
              🔥 Promoción
            </Badge>
          )}
          {!product.available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="secondary" className="text-white bg-gray-800">
                No disponible
              </Badge>
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 text-gray-800">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-restaurant-orange">
                ${product.price}
              </span>
            </div>
            
            <Button
              onClick={() => setIsModalOpen(true)}
              disabled={!product.available}
              className="bg-restaurant-orange hover:bg-restaurant-orange-dark text-white hover:scale-105 transition-transform"
            >
              Agregar
            </Button>
          </div>
        </CardContent>
      </Card>

      <ProductModal
        product={cartProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default ProductCard;
