
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  active: boolean;
}

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order');

    if (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Error al cargar las categorías",
        variant: "destructive"
      });
      return;
    }

    setCategories(data || []);
    setLoading(false);
  };

  const handleSaveCategory = async (categoryData: Partial<Category>) => {
    if (editingCategory) {
      // Update existing category
      const { error } = await supabase
        .from('categories')
        .update({
          name: categoryData.name,
          description: categoryData.description,
          icon: categoryData.icon,
          display_order: categoryData.display_order,
          active: categoryData.active,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingCategory.id);

      if (error) {
        console.error('Error updating category:', error);
        toast({
          title: "Error",
          description: "Error al actualizar la categoría",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Categoría actualizada",
        description: "Los cambios han sido guardados",
      });
    } else {
      // Add new category
      const { error } = await supabase
        .from('categories')
        .insert({
          name: categoryData.name,
          description: categoryData.description,
          icon: categoryData.icon,
          display_order: categoryData.display_order || 0,
          active: categoryData.active !== false
        });

      if (error) {
        console.error('Error creating category:', error);
        toast({
          title: "Error",
          description: "Error al crear la categoría",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Categoría creada",
        description: "La nueva categoría ha sido agregada",
      });
    }
    
    fetchCategories();
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleDeleteCategory = async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Error al eliminar la categoría",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Categoría eliminada",
      description: "La categoría ha sido eliminada",
    });
    
    fetchCategories();
  };

  const toggleCategoryStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('categories')
      .update({ active: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error('Error toggling category status:', error);
      return;
    }

    fetchCategories();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-restaurant-orange"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Categorías</h2>
        <Button 
          onClick={() => {
            setEditingCategory(null);
            setShowForm(true);
          }}
          className="bg-restaurant-orange hover:bg-restaurant-orange-dark"
        >
          ➕ Agregar Categoría
        </Button>
      </div>

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(category => (
          <Card key={category.id} className="relative">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <span className="text-2xl">{category.icon}</span>
                  {category.name}
                </h3>
                <Badge variant={category.active ? "default" : "secondary"}>
                  {category.active ? "Activa" : "Inactiva"}
                </Badge>
              </div>
              
              <p className="text-gray-600 text-sm mb-2">{category.description || 'Sin descripción'}</p>
              <p className="text-gray-500 text-sm mb-4">Orden: {category.display_order}</p>
              
              <div className="flex gap-2 mb-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingCategory(category);
                    setShowForm(true);
                  }}
                >
                  ✏️ Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  🗑️ Eliminar
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor={`status-${category.id}`} className="text-sm">
                  {category.active ? "Activa" : "Inactiva"}
                </Label>
                <Switch
                  id={`status-${category.id}`}
                  checked={category.active}
                  onCheckedChange={() => toggleCategoryStatus(category.id, category.active)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <CategoryForm
          category={editingCategory}
          onSave={handleSaveCategory}
          onCancel={() => {
            setShowForm(false);
            setEditingCategory(null);
          }}
        />
      )}
    </div>
  );
};

interface CategoryFormProps {
  category: Category | null;
  onSave: (category: Partial<Category>) => void;
  onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    icon: category?.icon || '',
    display_order: category?.display_order || 0,
    active: category?.active !== false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>
            {category ? 'Editar Categoría' : 'Nueva Categoría'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="icon">Icono (emoji)</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({...formData, icon: e.target.value})}
                placeholder="🍕"
              />
            </div>
            
            <div>
              <Label htmlFor="display_order">Orden de visualización</Label>
              <Input
                id="display_order"
                type="number"
                min="0"
                value={formData.display_order}
                onChange={(e) => setFormData({...formData, display_order: Number(e.target.value)})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="active">Activa</Label>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({...formData, active: checked})}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1 bg-restaurant-orange hover:bg-restaurant-orange-dark">
                Guardar
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryManagement;
