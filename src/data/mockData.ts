
import { CartItem } from '@/contexts/CartContext';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
}

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Hamburguesa Clásica',
    description: 'Carne jugosa, lechuga, tomate, cebolla y salsa especial',
    price: 12.99,
    image: '/placeholder.svg',
    category: 'Hamburguesas',
    available: true
  },
  {
    id: '2',
    name: 'Pizza Margherita',
    description: 'Salsa de tomate, mozzarella fresca y albahaca',
    price: 15.50,
    image: '/placeholder.svg',
    category: 'Pizzas',
    available: true
  },
  {
    id: '3',
    name: 'Tacos de Pollo',
    description: 'Pollo marinado, pico de gallo y salsa verde',
    price: 9.99,
    image: '/placeholder.svg',
    category: 'Mexicana',
    available: true
  },
  {
    id: '4',
    name: 'Ensalada César',
    description: 'Lechuga romana, crutones, parmesano y aderezo césar',
    price: 8.50,
    image: '/placeholder.svg',
    category: 'Ensaladas',
    available: true
  },
  {
    id: '5',
    name: 'Coca Cola',
    description: 'Refresco clásico 350ml',
    price: 2.50,
    image: '/placeholder.svg',
    category: 'Bebidas',
    available: true
  }
];

export const mockCategories = [
  { id: '1', name: 'Hamburguesas', icon: '🍔' },
  { id: '2', name: 'Pizzas', icon: '🍕' },
  { id: '3', name: 'Mexicana', icon: '🌮' },
  { id: '4', name: 'Ensaladas', icon: '🥗' },
  { id: '5', name: 'Bebidas', icon: '🥤' }
];
