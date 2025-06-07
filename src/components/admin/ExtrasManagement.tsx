import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface Extra {
  id: string;
  category_id: string;
  name: string;
  price: number;
  max_selections: number;
  required: boolean;
  active: boolean;
  categories?: {
    name: string;
  };
}

interface ExtraOption {
  id: string;
  extra_id: string;
  name: string;
  price: number;
  active: boolean;
}

const ExtrasManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [extraOptions, setExtraOptions] = useState<ExtraOption[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [editingExtra, setEditingExtra] = useState<Extra | null>(null);
  const [editingOption, setEditingOption] = useState<ExtraOption | null>(null);
  const [showExtraForm, setShowExtraForm] = useState(false);
  const [showOptionForm, setShowOptionForm] = useState(false);
  const [selectedExtraForOption, setSelectedExtraForOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([fetchCategories(), fetchExtras(), fetchExtraOptions()]).then(() => {
      setLoading(false);
    });
  }, []);

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

  const fetchExtras = async () => {
    const { data, error } = await supabase
      .from('extras')
      .select(`
        id,
        category_id,
        name,
        price,
        max_selections,
        required,
        active,
        categories (
          name
        )
      `)
      .order('created_at');

    if (error) {
      console.error('Error fetching extras:', error);
      return;
    }

    setExtras(data || []);
  };

  const fetchExtraOptions = async () => {
    const { data, error } = await supabase
      .from('extra_options')
      .select('*')
      .order('created_at');

    if (error) {
      console.error('Error fetching extra options:', error);
      return;
    }

    setExtraOptions(data || []);
  };

  const filteredExtras = selectedCategoryFilter === 'all' 
    ? extras 
    : extras.filter(extra => extra.category_id === selectedCategoryFilter);

  const handleDeleteExtra = async (extraId: string) => {
    // First delete all extra options associated with this extra
    const { error: optionsError } = await supabase
      .from('extra_options')
      .delete()
      .eq('extra_id', extraId);

    if (optionsError) {
      console.error('Error deleting extra options:', optionsError);
      toast({
        title: "Error",
        description: "Error al eliminar las opciones del extra",
        variant: "destructive"
      });
      return;
    }

    // Then delete the extra itself
    const { error } = await supabase
      .from('extras')
      .delete()
      .eq('id', extraId);

    if (error) {
      console.error('Error deleting extra:', error);
      toast({
        title: "Error",
        description: "Error al eliminar el extra",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Extra eliminado",
      description: "El extra y todas sus opciones han sido eliminados",
    });

    fetchExtras();
    fetchExtraOptions();
  };

  const handleDeleteExtraOption = async (optionId: string) => {
    const { error } = await supabase
      .from('extra_options')
      .delete()
      .eq('id', optionId);

    if (error) {
      console.error('Error deleting extra option:', error);
      toast({
        title: "Error",
        description: "Error al eliminar la opción",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Opción eliminada",
      description: "La opción ha sido eliminada correctamente",
    });

    fetchExtraOptions();
  };

  const handleSaveExtra = async (extraData: Partial<Extra>) => {
    if (editingExtra) {
      const { error } = await supabase
        .from('extras')
        .update({
          name: extraData.name,
          price: extraData.price,
          max_selections: extraData.max_selections,
          required: extraData.required,
          active: extraData.active,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingExtra.id);

      if (error) {
        console.error('Error updating extra:', error);
        toast({
          title: "Error",
          description: "Error al actualizar el extra",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Extra actualizado",
        description: "Los cambios han sido guardados",
      });
    } else {
      const { error } = await supabase
        .from('extras')
        .insert({
          category_id: extraData.category_id,
          name: extraData.name,
          price: extraData.price || 0,
          max_selections: extraData.max_selections || 1,
          required: extraData.required || false,
          active: extraData.active !== false
        });

      if (error) {
        console.error('Error creating extra:', error);
        toast({
          title: "Error",
          description: "Error al crear el extra",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Extra creado",
        description: "El nuevo extra ha sido agregado",
      });
    }
    
    fetchExtras();
    setEditingExtra(null);
    setShowExtraForm(false);
  };

  const handleSaveExtraOption = async (optionData: Partial<ExtraOption>) => {
    if (editingOption) {
      const { error } = await supabase
        .from('extra_options')
        .update({
          name: optionData.name,
          price: optionData.price,
          active: optionData.active
        })
        .eq('id', editingOption.id);

      if (error) {
        console.error('Error updating extra option:', error);
        toast({
          title: "Error",
          description: "Error al actualizar la opción",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Opción actualizada",
        description: "Los cambios han sido guardados",
      });
    } else {
      const { error } = await supabase
        .from('extra_options')
        .insert({
          extra_id: selectedExtraForOption,
          name: optionData.name,
          price: optionData.price || 0,
          active: optionData.active !== false
        });

      if (error) {
        console.error('Error creating extra option:', error);
        toast({
          title: "Error",
          description: "Error al crear la opción",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Opción creada",
        description: "La nueva opción ha sido agregada",
      });
    }
    
    fetchExtraOptions();
    setEditingOption(null);
    setShowOptionForm(false);
    setSelectedExtraForOption(null);
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Extras</h2>
        <Button 
          onClick={() => {
            setEditingExtra(null);
            setShowExtraForm(true);
          }}
          className="bg-restaurant-orange hover:bg-restaurant-orange-dark"
        >
          ➕ Agregar Extra
        </Button>
      </div>

      {/* Category Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Label htmlFor="category-filter">Filtrar por categoría:</Label>
            <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
              <SelectTrigger className="w-64">
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
        </CardContent>
      </Card>

      {/* Extras List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredExtras.map(extra => (
          <Card key={extra.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{extra.name}</CardTitle>
                  <p className="text-sm text-gray-500">Categoría: {extra.categories?.name}</p>
                </div>
                <div className="flex gap-1">
                  {extra.required && <Badge variant="destructive">Obligatorio</Badge>}
                  <Badge variant={extra.active ? "default" : "secondary"}>
                    {extra.active ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Precio base: ${extra.price}</span>
                  <span>Max. selecciones: {extra.max_selections}</span>
                </div>
                
                <div className="flex gap-2 mb-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingExtra(extra);
                      setShowExtraForm(true);
                    }}
                  >
                    ✏️ Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedExtraForOption(extra.id);
                      setEditingOption(null);
                      setShowOptionForm(true);
                    }}
                    className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  >
                    ➕ Opción
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar extra?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción eliminará el extra "{extra.name}" y todas sus opciones. No se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteExtra(extra.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {/* Extra Options */}
                <div className="border-t pt-3">
                  <p className="font-semibold text-sm mb-2">Opciones:</p>
                  {extraOptions
                    .filter(option => option.extra_id === extra.id)
                    .map(option => (
                      <div key={option.id} className="flex justify-between items-center bg-gray-50 p-2 rounded mb-1">
                        <span className="text-sm">{option.name} (+${option.price})</span>
                        <div className="flex gap-1 items-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingOption(option);
                              setSelectedExtraForOption(extra.id);
                              setShowOptionForm(true);
                            }}
                            className="h-6 w-6 p-0"
                          >
                            ✏️
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar opción?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción eliminará la opción "{option.name}". No se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteExtraOption(option.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <Badge variant={option.active ? "default" : "secondary"} className="text-xs">
                            {option.active ? "Activa" : "Inactiva"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Extra Form Modal */}
      {showExtraForm && (
        <ExtraForm
          extra={editingExtra}
          categories={categories}
          onSave={handleSaveExtra}
          onCancel={() => {
            setShowExtraForm(false);
            setEditingExtra(null);
          }}
        />
      )}

      {/* Extra Option Form Modal */}
      {showOptionForm && (
        <ExtraOptionForm
          option={editingOption}
          onSave={handleSaveExtraOption}
          onCancel={() => {
            setShowOptionForm(false);
            setEditingOption(null);
            setSelectedExtraForOption(null);
          }}
        />
      )}
    </div>
  );
};

interface ExtraFormProps {
  extra: Extra | null;
  categories: Category[];
  onSave: (extra: Partial<Extra>) => void;
  onCancel: () => void;
}

const ExtraForm: React.FC<ExtraFormProps> = ({ extra, categories, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    category_id: extra?.category_id || '',
    name: extra?.name || '',
    price: extra?.price || 0,
    max_selections: extra?.max_selections || 1,
    required: extra?.required || false,
    active: extra?.active !== false
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
            {extra ? 'Editar Extra' : 'Nuevo Extra'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="price">Precio base</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
              />
            </div>
            
            <div>
              <Label htmlFor="max_selections">Máximo de selecciones</Label>
              <Input
                id="max_selections"
                type="number"
                min="1"
                value={formData.max_selections}
                onChange={(e) => setFormData({...formData, max_selections: Number(e.target.value)})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="required">Obligatorio</Label>
              <Switch
                id="required"
                checked={formData.required}
                onCheckedChange={(checked) => setFormData({...formData, required: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="active">Activo</Label>
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

interface ExtraOptionFormProps {
  option: ExtraOption | null;
  onSave: (option: Partial<ExtraOption>) => void;
  onCancel: () => void;
}

const ExtraOptionForm: React.FC<ExtraOptionFormProps> = ({ option, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: option?.name || '',
    price: option?.price || 0,
    active: option?.active !== false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {option ? 'Editar Opción' : 'Nueva Opción'}
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
              <Label htmlFor="price">Precio adicional</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
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

export default ExtrasManagement;
