import burger from "@/assets/burger.jpg";
import pizza from "@/assets/pizza.jpg";
import dessert from "@/assets/dessert.jpg";
import drink from "@/assets/drink.jpg";
import type { Category, ExtraGroup, PaymentInfo, Product } from "./types";

export const seedCategories: Category[] = [
  { id: "c1", name: "Hamburguesas" },
  { id: "c2", name: "Pizzas" },
  { id: "c3", name: "Postres" },
  { id: "c4", name: "Bebidas" },
];

export const seedExtraGroups: ExtraGroup[] = [
  {
    id: "g1",
    name: "Adicionales",
    multi: true,
    required: false,
    options: [
      { id: "o1", name: "Queso cheddar extra", price: 800 },
      { id: "o2", name: "Bacon", price: 1200 },
      { id: "o3", name: "Huevo frito", price: 700 },
      { id: "o4", name: "Cebolla caramelizada", price: 600 },
    ],
    categoryIds: ["c1"],
  },
  {
    id: "g2",
    name: "Punto de cocción",
    multi: false,
    required: true,
    options: [
      { id: "p1", name: "Jugosa", price: 0 },
      { id: "p2", name: "A punto", price: 0 },
      { id: "p3", name: "Bien cocida", price: 0 },
    ],
    categoryIds: ["c1"],
  },
  {
    id: "g3",
    name: "Tamaño",
    multi: false,
    required: true,
    options: [
      { id: "s1", name: "Personal", price: 0 },
      { id: "s2", name: "Mediana", price: 2500 },
      { id: "s3", name: "Familiar", price: 4500 },
    ],
    categoryIds: ["c2"],
  },
];

export const seedProducts: Product[] = [
  {
    id: "p1",
    name: "Smash Royale",
    description: "Doble medallón smash, cheddar fundido, pickles y salsa de la casa.",
    price: 8900,
    image: burger,
    categoryId: "c1",
    extraGroupIds: ["g1", "g2"],
  },
  {
    id: "p2",
    name: "Truffle Burger",
    description: "Carne premium, mayo de trufa, rúcula y queso brie.",
    price: 11500,
    image: burger,
    categoryId: "c1",
    extraGroupIds: ["g1", "g2"],
  },
  {
    id: "p3",
    name: "Margherita d'Autore",
    description: "Tomate San Marzano, mozzarella fior di latte, albahaca fresca.",
    price: 9800,
    image: pizza,
    categoryId: "c2",
    extraGroupIds: ["g3"],
  },
  {
    id: "p4",
    name: "Coulant de Chocolate",
    description: "Volcán de chocolate belga con corazón líquido y frutos rojos.",
    price: 4900,
    image: dessert,
    categoryId: "c3",
    extraGroupIds: [],
  },
  {
    id: "p5",
    name: "Old Fashioned",
    description: "Bourbon, azúcar morena, angostura y twist de naranja.",
    price: 5500,
    image: drink,
    categoryId: "c4",
    extraGroupIds: [],
  },
];

export const seedPayment: PaymentInfo = {
  alias: "pedi2.gourmet",
  cvu: "0000003100012345678901",
  accountName: "Pedi2 Gourmet S.A.",
  whatsapp: "5493518173793",
};
