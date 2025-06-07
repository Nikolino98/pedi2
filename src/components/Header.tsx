
import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Navbar, NavbarBrand, NavbarContent, NavbarItem, Chip } from '@nextui-org/react';
import { useCart } from '@/contexts/CartContext';

interface HeaderProps {
  onCartOpen: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCartOpen }) => {
  const { items } = useCart();
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <Navbar 
      shouldHideOnScroll 
      className="bg-gradient-to-r from-restaurant-orange to-restaurant-orange-dark shadow-lg border-b border-restaurant-orange-light/20"
      classNames={{
        wrapper: "px-4 sm:px-6 lg:px-8 max-w-7xl"
      }}
    >
      <NavbarBrand>
        <div className="flex items-center gap-3">
          <motion.span 
            className="text-4xl"
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
          >
            🛒
          </motion.span>
          <motion.h1 
            className="text-3xl font-bold text-white tracking-tight bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            Pedi2
          </motion.h1>
        </div>
      </NavbarBrand>

      <NavbarContent justify="end">
        <NavbarItem>
          <Button
            isIconOnly
            variant="light"
            onClick={onCartOpen}
            className="relative text-white hover:bg-white/10 transition-colors"
            size="lg"
          >
            <ShoppingBag size={24} />
            {itemCount > 0 && (
              <Chip 
                size="sm"
                color="danger" 
                className="absolute -top-1 -right-1 min-w-5 h-5 text-xs"
              >
                {itemCount}
              </Chip>
            )}
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};

export default Header;
