import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  available: boolean;
  is_promotion: boolean;
  categories?: {
    name: string;
  };
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCategories()]).then(() => {
      setLoading(false);
    });
  }, []);

  const fetchProducts = async () => {
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
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Error al cargar los productos",
        variant: "destructive"
      });
      return;
    }

    setProducts(data || []);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .eq('active', true)
      .order('display_order');

    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }

    setCategories(data || []);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category_id === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && product.available) ||
      (filterStatus === 'inactive' && !product.available);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleSaveProduct = async (productData: Partial<Product>) => {
    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          category_id: productData.category_id,
          available: productData.available,
          is_promotion: productData.is_promotion,
          image_url: productData.image_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingProduct.id);

      if (error) {
        console.error('Error updating product:', error);
        toast({
          title: "Error",
          description: "Error al actualizar el producto",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Producto actualizado",
        description: "Los cambios han sido guardados",
      });
    } else {
      const { error } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          category_id: productData.category_id,
          image_url: productData.image_url || '',
          available: productData.available !== false,
          is_promotion: productData.is_promotion || false
        });

      if (error) {
        console.error('Error creating product:', error);
        toast({
          title: "Error",
          description: "Error al crear el producto",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Producto creado",
        description: "El nuevo producto ha sido agregado",
      });
    }
    
    fetchProducts();
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleDeleteProduct = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Error al eliminar el producto",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Producto eliminado",
      description: "El producto ha sido eliminado del catálogo",
    });
    
    fetchProducts();
  };

  const toggleProductPromotion = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('products')
      .update({ is_promotion: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error('Error toggling product promotion:', error);
      return;
    }

    fetchProducts();
  };

  const toggleProductStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('products')
      .update({ available: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error('Error toggling product status:', error);
      return;
    }

    fetchProducts();
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
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Productos</h2>
        <Button 
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className="bg-restaurant-orange hover:bg-restaurant-orange-dark"
        >
          ➕ Agregar Producto
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Buscar producto</Label>
              <Input
                id="search"
                placeholder="Nombre del producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="category">Categoría</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map(product => (
          <Card key={product.id} className="relative">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <div className="flex gap-1">
                  {product.is_promotion && (
                    <Badge className="bg-restaurant-red text-white">🔥</Badge>
                  )}
                  <Badge variant={product.available ? "default" : "secondary"}>
                    {product.available ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-2">{product.description}</p>
              <p className="text-restaurant-orange font-bold text-lg mb-3">${product.price}</p>
              <p className="text-gray-500 text-sm mb-4">Categoría: {product.categories?.name}</p>
              
              <div className="flex gap-2 mb-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingProduct(product);
                    setShowForm(true);
                  }}
                >
                  ✏️ Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleProductPromotion(product.id, product.is_promotion)}
                  className={product.is_promotion ? "bg-restaurant-red text-white" : ""}
                >
                  🔥
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteProduct(product.id)}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  🗑️
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor={`status-${product.id}`} className="text-sm">
                  {product.available ? "Disponible" : "No disponible"}
                </Label>
                <Switch
                  id={`status-${product.id}`}
                  checked={product.available}
                  onCheckedChange={() => toggleProductStatus(product.id, product.available)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          onSave={handleSaveProduct}
          onCancel={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
};

interface ProductFormProps {
  product: Product | null;
  categories: Category[];
  onSave: (product: Partial<Product>) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, categories, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    category_id: product?.category_id || '',
    available: product?.available !== false,
    is_promotion: product?.is_promotion || false,
    image_url: product?.image_url || ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      toast({
        title: "Error",
        description: "Error al subir la imagen",
        variant: "destructive"
      });
      return null;
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    let imageUrl = formData.image_url;

    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        setUploading(false);
        return;
      }
    }

    onSave({ ...formData, image_url: imageUrl });
    setUploading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>
            {product ? 'Editar Producto' : 'Nuevo Producto'}
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
              <Label htmlFor="price">Precio *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="category">Categoría *</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value) => setFormData({...formData, category_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="image">Imagen del producto</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {formData.image_url && (
                <div className="mt-2">
                  <img 
                    src={formData.image_url} 
                    alt="Preview" 
                    className="w-20 h-20 object-cover rounded"
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="available">Disponible</Label>
              <Switch
                id="available"
                checked={formData.available}
                onCheckedChange={(checked) => setFormData({...formData, available: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="promotion">Promoción destacada</Label>
              <Switch
                id="promotion"
                checked={formData.is_promotion}
                onCheckedChange={(checked) => setFormData({...formData, is_promotion: checked})}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                className="flex-1 bg-restaurant-orange hover:bg-restaurant-orange-dark"
                disabled={uploading}
              >
                {uploading ? 'Subiendo...' : 'Guardar'}
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

export default ProductManagement;
