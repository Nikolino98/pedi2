
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductManagement from './ProductManagement';
import CategoryManagement from './CategoryManagement';
import ExtrasManagement from './ExtrasManagement';
import OrderManagement from './OrderManagement';
import SalesAnalytics from './SalesAnalytics';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-restaurant-orange-dark">
                🏪 Pedi2 - Admin
              </h1>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="orders">📋 Pedidos</TabsTrigger>
            <TabsTrigger value="products">📦 Productos</TabsTrigger>
            <TabsTrigger value="categories">🏷️ Categorías</TabsTrigger>
            <TabsTrigger value="extras">➕ Extras</TabsTrigger>
            <TabsTrigger value="analytics">📊 Análisis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders">
            <OrderManagement />
          </TabsContent>
          
          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>
          
          <TabsContent value="categories">
            <CategoryManagement />
          </TabsContent>
          
          <TabsContent value="extras">
            <ExtrasManagement />
          </TabsContent>
          
          <TabsContent value="analytics">
            <SalesAnalytics />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
