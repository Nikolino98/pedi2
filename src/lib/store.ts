import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
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
  hasInitialized: boolean;
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
      categories: [],
      products: [],
      extraGroups: [],
      payment: seedPayment,
      cart: [],
      isLoading: false,
      hasInitialized: false,

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
            categories,
            products,
            extraGroups,
            payment: payment || seedPayment,
            hasInitialized: true,
          });
        } catch (error) {
          console.error("Error fetching data from Supabase:", error);
          // Si hay error y no tenemos datos, usamos seeds como último recurso
          const state = get();
          if (state.categories.length === 0) {
            set({
              categories: seedCategories,
              products: seedProducts,
              extraGroups: seedExtraGroups,
              payment: seedPayment,
            });
          }
          toast.error("Error al conectar con la base de datos. Usando datos locales.");
        } finally {
          set({ isLoading: false });
        }
      },

      addCategory: async (name) => {
        try {
          const newCat = await supabaseService.addCategory(name);
          set((s) => ({ categories: [...s.categories, newCat] }));
          toast.success("Categoría añadida");
        } catch (error) {
          console.error("Error adding category:", error);
          toast.error("Error al guardar en la base de datos");
          throw error;
        }
      },

      updateCategory: async (id, name) => {
        try {
          await supabaseService.updateCategory(id, name);
          set((s) => ({
            categories: s.categories.map((c) => (c.id === id ? { ...c, name } : c)),
          }));
          toast.success("Categoría actualizada");
        } catch (error) {
          console.error("Error updating category:", error);
          toast.error("Error al actualizar la categoría");
          throw error;
        }
      },

      deleteCategory: async (id) => {
        try {
          await supabaseService.deleteCategory(id);
          set((s) => ({
            categories: s.categories.filter((c) => c.id !== id),
            products: s.products.filter((p) => p.categoryId !== id),
          }));
          toast.success("Categoría eliminada");
        } catch (error) {
          console.error("Error deleting category:", error);
          toast.error("Error al eliminar la categoría");
          throw error;
        }
      },

      upsertProduct: async (p) => {
        try {
          const savedProduct = await supabaseService.upsertProduct(p);
          // Convertir el formato de Supabase al formato de nuestro Product si es necesario
          const formattedProduct: Product = {
            ...savedProduct,
            image: savedProduct.image_url,
            categoryId: savedProduct.category_id,
            extraGroupIds: p.extraGroupIds, // Mantenemos estos ya que vienen del form
          };

          set((s) => {
            const exists = s.products.some((x) => x.id === p.id || x.id === formattedProduct.id);
            return {
              products: exists
                ? s.products.map((x) => (x.id === p.id || x.id === formattedProduct.id ? formattedProduct : x))
                : [...s.products, formattedProduct],
            };
          });
          toast.success("Producto guardado");
        } catch (error) {
          console.error("Error upserting product:", error);
          toast.error("Error al guardar el producto");
          throw error;
        }
      },

      deleteProduct: async (id) => {
        try {
          await supabaseService.deleteProduct(id);
          set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
          toast.success("Producto eliminado");
        } catch (error) {
          console.error("Error deleting product:", error);
          toast.error("Error al eliminar el producto");
          throw error;
        }
      },

      upsertExtraGroup: async (g) => {
        try {
          const savedGroup = await supabaseService.upsertExtraGroup(g);
          set((s) => {
            const exists = s.extraGroups.some((x) => x.id === g.id || x.id === savedGroup.id);
            return {
              extraGroups: exists
                ? s.extraGroups.map((x) => (x.id === g.id || x.id === savedGroup.id ? savedGroup : x))
                : [...s.extraGroups, savedGroup],
            };
          });
          toast.success("Grupo de extras guardado");
        } catch (error) {
          console.error("Error upserting extra group:", error);
          toast.error("Error al guardar el grupo de extras");
          throw error;
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
          toast.success("Grupo de extras eliminado");
        } catch (error) {
          console.error("Error deleting extra group:", error);
          toast.error("Error al eliminar el grupo de extras");
          throw error;
        }
      },

      updatePayment: async (p) => {
        try {
          await supabaseService.updatePayment(p);
          set({ payment: p });
          toast.success("Información de pago actualizada");
        } catch (error) {
          console.error("Error updating payment info:", error);
          toast.error("Error al actualizar la información de pago");
          throw error;
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
