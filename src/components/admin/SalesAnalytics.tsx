import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SalesData {
  period: string;
  sales: number;
  revenue: number;
}

interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
}

interface PaymentMethodStats {
  cash: number;
  card: number;
}

const SalesAnalytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentMethodStats>({ cash: 0, card: 0 });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSalesData();
  }, [selectedPeriod]);

  const fetchSalesData = async () => {
    setLoading(true);
    
    try {
      // Fetch orders with items
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          created_at,
          status,
          payment_method,
          order_items (
            id,
            quantity,
            total_price,
            products (
              name
            )
          )
        `)
        .eq('status', 'delivered')
        .order('created_at', { ascending: false });

      if (ordersError) {
        throw ordersError;
      }

      // Process sales data by period
      const processedSalesData = processSalesDataByPeriod(ordersData || [], selectedPeriod);
      setSalesData(processedSalesData);

      // Process top products
      const processedTopProducts = processTopProducts(ordersData || []);
      setTopProducts(processedTopProducts);

      // Process payment method statistics
      const processedPaymentStats = processPaymentMethodStats(ordersData || []);
      setPaymentStats(processedPaymentStats);

    } catch (error) {
      console.error('Error fetching sales data:', error);
      toast({
        title: "Error",
        description: "Error al cargar los datos de ventas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const processSalesDataByPeriod = (orders: any[], period: string): SalesData[] => {
    const groupedData: { [key: string]: { sales: number; revenue: number } } = {};

    orders.forEach(order => {
      const date = new Date(order.created_at);
      let periodKey: string;

      switch (period) {
        case 'daily':
          periodKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          periodKey = `Semana ${weekStart.toLocaleDateString('es-ES')}`;
          break;
        case 'monthly':
          periodKey = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
          break;
        default:
          periodKey = date.toISOString().split('T')[0];
      }

      if (!groupedData[periodKey]) {
        groupedData[periodKey] = { sales: 0, revenue: 0 };
      }

      groupedData[periodKey].sales += 1;
      groupedData[periodKey].revenue += order.total_amount;
    });

    return Object.entries(groupedData)
      .map(([period, data]) => ({
        period,
        sales: data.sales,
        revenue: data.revenue
      }))
      .sort((a, b) => a.period.localeCompare(b.period))
      .slice(-10); // Show last 10 periods
  };

  const processTopProducts = (orders: any[]): TopProduct[] => {
    const productStats: { [key: string]: { sales: number; revenue: number } } = {};

    orders.forEach(order => {
      order.order_items.forEach((item: any) => {
        const productName = item.products.name;
        
        if (!productStats[productName]) {
          productStats[productName] = { sales: 0, revenue: 0 };
        }

        productStats[productName].sales += item.quantity;
        productStats[productName].revenue += item.total_price;
      });
    });

    return Object.entries(productStats)
      .map(([name, stats]) => ({
        name,
        sales: stats.sales,
        revenue: stats.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5); // Top 5 products
  };

  const processPaymentMethodStats = (orders: any[]): PaymentMethodStats => {
    const stats = { cash: 0, card: 0 };
    
    orders.forEach(order => {
      if (order.payment_method === 'cash') {
        stats.cash += 1;
      } else if (order.payment_method === 'card') {
        stats.card += 1;
      }
    });

    return stats;
  };

  const getTotalStats = () => {
    const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0);
    const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
    
    return { totalSales, totalRevenue };
  };

  const downloadReport = () => {
    const stats = getTotalStats();
    
    let csvContent = "Período,Ventas,Ingresos\n";
    salesData.forEach(item => {
      csvContent += `${item.period},${item.sales},${item.revenue}\n`;
    });
    
    csvContent += `\nResumen:\n`;
    csvContent += `Total de ventas,${stats.totalSales}\n`;
    csvContent += `Ingresos totales,${stats.totalRevenue}\n`;
    csvContent += `Valor promedio por pedido,${stats.averageOrderValue.toFixed(2)}\n`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-ventas-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = getTotalStats();

  const paymentChartData = [
    { name: 'Efectivo', value: paymentStats.cash, color: '#22c55e' },
    { name: 'Transferencia/Digital', value: paymentStats.card, color: '#3b82f6' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-restaurant-orange"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Análisis de Ventas</h2>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Por días</SelectItem>
              <SelectItem value="weekly">Por semanas</SelectItem>
              <SelectItem value="monthly">Por meses</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={downloadReport}
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
          >
            📊 Descargar Reporte
          </Button>
          <Button 
            onClick={fetchSalesData}
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
          >
            🔄 Actualizar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ventas</CardTitle>
            <span className="text-2xl">📦</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-restaurant-orange">{stats.totalSales}</div>
            <p className="text-xs text-muted-foreground">
              pedidos entregados en el período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              en el período seleccionado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Métodos de Pago</CardTitle>
            <span className="text-2xl">💳</span>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">💵 Efectivo:</span>
                <span className="font-bold text-green-600">{paymentStats.cash}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">💳 Digital:</span>
                <span className="font-bold text-blue-600">{paymentStats.card}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Período</CardTitle>
          </CardHeader>
          <CardContent>
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#FF6B35" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-gray-500">
                No hay datos de ventas disponibles
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métodos de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentChartData.some(item => item.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-gray-500">
                No hay datos de métodos de pago disponibles
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Ingresos por Período</CardTitle>
        </CardHeader>
        <CardContent>
          {salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Ingresos']} />
                <Line type="monotone" dataKey="revenue" stroke="#FFA726" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500">
              No hay datos de ingresos disponibles
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Productos Más Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-restaurant-orange">#{index + 1}</span>
                    <div>
                      <h4 className="font-semibold">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.sales} unidades vendidas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${product.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">ingresos</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No hay datos de productos disponibles
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesAnalytics;
