
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@nextui-org/react';
import { motion } from 'framer-motion';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategoryFilterProps {
  onCategorySelect: (categoryId: string) => void;
  selectedCategory: string;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ onCategorySelect, selectedCategory }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, icon')
      .eq('active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      setLoading(false);
      return;
    }

    setCategories(data || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-restaurant-orange"></div>
      </div>
    );
  }

  return (
    <motion.div 
      className="mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-bold text-gray-800 mb-4">🍽️ Categorías</h2>
      <div className="flex flex-wrap gap-3">
        <Button
          variant={selectedCategory === 'all' ? 'solid' : 'bordered'}
          color={selectedCategory === 'all' ? 'warning' : 'default'}
          onClick={() => onCategorySelect('all')}
          className={`${
            selectedCategory === 'all' 
              ? 'bg-restaurant-orange text-white hover:bg-restaurant-orange-dark' 
              : 'border-restaurant-orange text-restaurant-orange hover:bg-restaurant-orange hover:text-white'
          } transition-all duration-200`}
          startContent={<span>🍳</span>}
        >
          Todos
        </Button>
        
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'solid' : 'bordered'}
            color={selectedCategory === category.id ? 'warning' : 'default'}
            onClick={() => onCategorySelect(category.id)}
            className={`${
              selectedCategory === category.id 
                ? 'bg-restaurant-orange text-white hover:bg-restaurant-orange-dark' 
                : 'border-restaurant-orange text-restaurant-orange hover:bg-restaurant-orange hover:text-white'
            } transition-all duration-200`}
            startContent={<span>{category.icon || '🍽️'}</span>}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </motion.div>
  );
};

export default CategoryFilter;
