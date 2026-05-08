import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CartItem,
  Category,
  ExtraGroup,
  PaymentInfo,
  Product,
} from "./types";
import {
  seedCategories,
  seedExtraGroups,
  seedPayment,
  seedProducts,
} from "./seed-data";
import { supabaseService } from "./supabase-service";

type State = {
  categories: Category[];
  products: Product[];
  extraGroups: ExtraGroup[];
  payment: PaymentInfo;
  cart: CartItem[];
  isLoading: boolean;
};

type Actions = {
  // initialization
  fetchData: () => Promise<void>;
  // catalog
  addCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  upsertProduct: (p: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  upsertExtraGroup: (g: ExtraGroup) => Promise<void>;
  deleteExtraGroup: (id: string) => Promise<void>;
  updatePayment: (p: PaymentInfo) => Promise<void>;
  // images
  uploadProductImage: (file: File) => Promise<string>;
  // cart
  addToCart: (item: CartItem) => void;
  updateCartQty: (lineId: string, qty: number) => void;
  removeFromCart: (lineId: string) => void;
  clearCart: () => void;
};

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      categories: seedCategories,
      products: seedProducts,
      extraGroups: seedExtraGroups,
      payment: seedPayment,
      cart: [],
      isLoading: false,

      fetchData: async () => {
        set({ isLoading: true });
        try {
          const [categories, products, extraGroups, payment] = await Promise.all([
            supabaseService.getCategories(),
            supabaseService.getProducts(),
            supabaseService.getExtraGroups(),
            supabaseService.getPaymentInfo(),
          ]);

          set({
            categories: categories.length ? categories : seedCategories,
            products: products.length ? products : seedProducts,
            extraGroups: extraGroups.length ? extraGroups : seedExtraGroups,
            payment: payment || seedPayment,
          });
        } catch (error) {
          console.error("Error fetching data from Supabase:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      addCategory: async (name) => {
        try {
          const newCat = await supabaseService.addCategory(name);
          set((s) => ({ categories: [...s.categories, newCat] }));
        } catch (error) {
          console.error("Error adding category:", error);
          // Fallback to local
          set((s) => ({
            categories: [...s.categories, { id: crypto.randomUUID(), name }],
          }));
        }
      },

      updateCategory: async (id, name) => {
        try {
          await supabaseService.updateCategory(id, name);
          set((s) => ({
            categories: s.categories.map((c) => (c.id === id ? { ...c, name } : c)),
          }));
        } catch (error) {
          console.error("Error updating category:", error);
        }
      },

      deleteCategory: async (id) => {
        try {
          await supabaseService.deleteCategory(id);
          set((s) => ({
            categories: s.categories.filter((c) => c.id !== id),
            products: s.products.filter((p) => p.categoryId !== id),
          }));
        } catch (error) {
          console.error("Error deleting category:", error);
        }
      },

      upsertProduct: async (p) => {
        try {
          await supabaseService.upsertProduct(p);
          set((s) => {
            const exists = s.products.some((x) => x.id === p.id);
            return {
              products: exists
                ? s.products.map((x) => (x.id === p.id ? p : x))
                : [...s.products, p],
            };
          });
        } catch (error) {
          console.error("Error upserting product:", error);
        }
      },

      deleteProduct: async (id) => {
        try {
          await supabaseService.deleteProduct(id);
          set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
        } catch (error) {
          console.error("Error deleting product:", error);
        }
      },

      upsertExtraGroup: async (g) => {
        try {
          await supabaseService.upsertExtraGroup(g);
          set((s) => {
            const exists = s.extraGroups.some((x) => x.id === g.id);
            return {
              extraGroups: exists
                ? s.extraGroups.map((x) => (x.id === g.id ? g : x))
                : [...s.extraGroups, g],
            };
          });
        } catch (error) {
          console.error("Error upserting extra group:", error);
        }
      },

      deleteExtraGroup: async (id) => {
        try {
          await supabaseService.deleteExtraGroup(id);
          set((s) => ({
            extraGroups: s.extraGroups.filter((g) => g.id !== id),
            products: s.products.map((p) => ({
              ...p,
              extraGroupIds: p.extraGroupIds.filter((gid) => gid !== id),
            })),
          }));
        } catch (error) {
          console.error("Error deleting extra group:", error);
        }
      },

      updatePayment: async (p) => {
        try {
          await supabaseService.updatePayment(p);
          set({ payment: p });
        } catch (error) {
          console.error("Error updating payment info:", error);
        }
      },

      uploadProductImage: async (file) => {
        return await supabaseService.uploadImage(file);
      },

      addToCart: (item) => set((s) => ({ cart: [...s.cart, item] })),
      updateCartQty: (lineId, qty) =>
        set((s) => ({
          cart: s.cart
            .map((c) => (c.id === lineId ? { ...c, qty } : c))
            .filter((c) => c.qty > 0),
        })),
      removeFromCart: (lineId) =>
        set((s) => ({ cart: s.cart.filter((c) => c.id !== lineId) })),
      clearCart: () => set({ cart: [] }),
    }),
    { name: "pedi2-store" }
  )
);

export const formatARS = (n: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);

export const cartItemTotal = (item: CartItem) =>
  (item.price + item.extras.reduce((a, e) => a + e.price, 0)) * item.qty;

export const cartTotal = (cart: CartItem[]) =>
  cart.reduce((a, i) => a + cartItemTotal(i), 0);
