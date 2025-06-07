
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from './ProductCard';
import Header from './Header';
import Cart from './Cart';
import CategoryFilter from './CategoryFilter';
import HeroSection from './HeroSection';

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

const ProductCatalog: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        image_url,
        category_id,
        available,
        is_promotion,
        categories (
          name
        )
      `)
      .eq('available', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
      return;
    }

    // Transform the data to match our Product interface
    const transformedProducts: Product[] = data?.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      image_url: product.image_url || '',
      category_id: product.category_id || '',
      available: product.available,
      is_promotion: product.is_promotion,
      category: product.categories?.name || 'Sin categoría'
    })) || [];

    setProducts(transformedProducts);
    setLoading(false);
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products
    : products.filter(p => p.category_id === selectedCategory);

  const promotionProducts = products.filter(p => p.is_promotion);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        <main className="container mx-auto px-4 py-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-restaurant-orange"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        
        {/* Hero Section with Restaurant Background */}
        <HeroSection />
        
        <main className="container mx-auto px-4 py-6">
          {/* Category Filter */}
          <CategoryFilter 
            onCategorySelect={setSelectedCategory}
            selectedCategory={selectedCategory}
          />

          {/* Promotions Section */}
          {selectedCategory === 'all' && promotionProducts.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-gray-800 animate-fade-in">🔥 Promociones Especiales</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {promotionProducts.slice(0, 3).map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}

          {/* Products Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-bold text-gray-800 animate-fade-in">
                {selectedCategory === 'all' ? '🍽️ Nuestro Menú' : `${filteredProducts[0]?.category || 'Productos'}`}
              </h2>
              <span className="text-gray-500 animate-fade-in">({filteredProducts.length} productos)</span>
            </div>
            
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 animate-fade-in">
                <p className="text-gray-500 text-lg">No hay productos disponibles en esta categoría</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
      
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default ProductCatalog;
