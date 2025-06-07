
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  total_amount: number;
  status: string;
  delivery_type: string;
  payment_method: string;
  special_instructions: string | null;
  created_at: string;
  order_items: OrderItem[];
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions: string | null;
  products: {
    name: string;
  };
  order_item_extras: OrderItemExtra[];
}

interface OrderItemExtra {
  id: string;
  quantity: number;
  unit_price: number;
  extra_options: {
    name: string;
  };
}

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        customer_name,
        customer_phone,
        customer_address,
        total_amount,
        status,
        delivery_type,
        payment_method,
        special_instructions,
        created_at,
        order_items (
          id,
          product_id,
          quantity,
          unit_price,
          total_price,
          special_instructions,
          products (
            name
          ),
          order_item_extras (
            id,
            quantity,
            unit_price,
            extra_options (
              name
            )
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Error al cargar los pedidos",
        variant: "destructive"
      });
    } else {
      setOrders(data || []);
    }
    
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el estado del pedido",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Estado actualizado",
        description: `El pedido ha sido marcado como ${newStatus}`,
      });
      fetchOrders(); // Refresh the orders
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pendiente</Badge>;
      case 'preparing':
        return <Badge className="bg-yellow-500">Preparando</Badge>;
      case 'ready':
        return <Badge className="bg-blue-500">Listo</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500">Entregado</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Pedidos</h2>
        <Button 
          onClick={fetchOrders}
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
        >
          🔄 Actualizar
        </Button>
      </div>

      {/* Status Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label htmlFor="status-filter" className="font-medium">Filtrar por estado:</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="preparing">Preparando</SelectItem>
                <SelectItem value="ready">Listo</SelectItem>
                <SelectItem value="delivered">Entregado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay pedidos para mostrar</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell className="font-medium">{order.customer_name}</TableCell>
                    <TableCell>{order.customer_phone}</TableCell>
                    <TableCell className="font-bold text-green-600">${order.total_amount}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {order.delivery_type === 'delivery' ? '🚚 Delivery' : '🏪 Retiro'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="preparing">Preparando</SelectItem>
                          <SelectItem value="ready">Listo</SelectItem>
                          <SelectItem value="delivered">Entregado</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Order Details Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredOrders.slice(0, 4).map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Pedido #{order.id.slice(-8)}</CardTitle>
                  <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                </div>
                {getStatusBadge(order.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold">{order.customer_name}</p>
                  <p className="text-sm text-gray-600">{order.customer_phone}</p>
                  {order.customer_address && (
                    <p className="text-sm text-gray-600">{order.customer_address}</p>
                  )}
                </div>
                
                <div className="border-t pt-3">
                  <h4 className="font-semibold mb-2">Items del pedido:</h4>
                  {order.order_items.map((item) => (
                    <div key={item.id} className="text-sm mb-2">
                      <span className="font-medium">{item.quantity}x {item.products.name}</span>
                      <span className="float-right">${item.total_price}</span>
                      {item.order_item_extras.length > 0 && (
                        <div className="ml-4 text-gray-500">
                          {item.order_item_extras.map((extra) => (
                            <div key={extra.id}>
                              + {extra.extra_options.name} (+${extra.unit_price})
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {order.special_instructions && (
                  <div className="border-t pt-3">
                    <h4 className="font-semibold mb-1">Instrucciones:</h4>
                    <p className="text-sm text-gray-600">{order.special_instructions}</p>
                  </div>
                )}
                
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="font-bold">Total: ${order.total_amount}</span>
                  <Badge variant="outline">
                    {order.payment_method === 'cash' ? '💵 Efectivo' : '💳 Tarjeta'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrderManagement;
