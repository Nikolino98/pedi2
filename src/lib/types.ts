export type ExtraOption = {
  id: string;
  name: string;
  price: number;
};

export type ExtraGroup = {
  id: string;
  name: string;
  multi: boolean;
  required: boolean;
  options: ExtraOption[];
  categoryIds: string[];
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  extraGroupIds: string[];
};

export type Category = {
  id: string;
  name: string;
};

export type CartExtra = { groupId: string; optionId: string; name: string; price: number };

export type CartItem = {
  id: string; // unique line id
  productId: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  extras: CartExtra[];
  notes?: string;
};

export type PaymentInfo = {
  alias: string;
  cvu: string;
  accountName: string;
  whatsapp: string; // international format e.g. 5491122334455
};
