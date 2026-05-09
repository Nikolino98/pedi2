import { supabase } from "./supabase";
import type { Category, ExtraGroup, PaymentInfo, Product } from "./types";

export const supabaseService = {
  async getCategories() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    if (error) throw error;
    return data as Category[];
  },

  async getExtraGroups() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("extra_groups")
      .select("*, extra_options(*), category_extra_groups(category_id)")
      .order("name");
    if (error) throw error;
    return data.map((g: any) => ({
      ...g,
      options: g.extra_options || [],
      categoryIds: g.category_extra_groups?.map((ceg: any) => ceg.category_id) || [],
    })) as ExtraGroup[];
  },

  async getProducts() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("products")
      .select("*, product_extra_groups(group_id)")
      .order("name");
    if (error) throw error;
    return data.map((p: any) => ({
      ...p,
      image: p.image_url,
      categoryId: p.category_id,
      extraGroupIds: p.product_extra_groups?.map((eg: any) => eg.group_id) || [],
    })) as Product[];
  },

  async getPaymentInfo() {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("payment_info")
      .select("*")
      .eq("id", 1)
      .single();
    if (error && error.code !== "PGRST116") throw error; // PGRST116 is "no rows returned"
    if (!data) return null;
    return {
      ...data,
      accountName: data.account_name,
    } as PaymentInfo;
  },

  async upsertProduct(product: Product) {
    if (!supabase) throw new Error("Supabase not initialized");
    
    // Si el ID es un UUID temporal (ej. de crypto.randomUUID), intentamos upsert.
    // Si es un producto nuevo sin ID, dejamos que Supabase lo genere.
    const productData: any = {
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image,
      category_id: product.categoryId,
    };

    if (product.id && !product.id.startsWith("temp-")) {
      productData.id = product.id;
    }

    const { data, error: pError } = await supabase
      .from("products")
      .upsert(productData)
      .select()
      .single();

    if (pError) throw pError;
    const newProductId = data.id;

    // 2. Update many-to-many relationships for extras
    // Delete existing
    await supabase.from("product_extra_groups").delete().eq("product_id", newProductId);
    
    // Insert new ones
    if (product.extraGroupIds.length > 0) {
      const { error: egError } = await supabase.from("product_extra_groups").insert(
        product.extraGroupIds.map((groupId) => ({
          product_id: newProductId,
          group_id: groupId,
        }))
      );
      if (egError) throw egError;
    }

    return data;
  },

  async deleteProduct(id: string) {
    if (!supabase) throw new Error("Supabase not initialized");
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
  },

  async addCategory(name: string) {
    if (!supabase) throw new Error("Supabase not initialized");
    const { data, error } = await supabase.from("categories").insert({ name }).select().single();
    if (error) throw error;
    return data as Category;
  },

  async updateCategory(id: string, name: string) {
    if (!supabase) throw new Error("Supabase not initialized");
    const { error } = await supabase.from("categories").update({ name }).eq("id", id);
    if (error) throw error;
  },

  async deleteCategory(id: string) {
    if (!supabase) throw new Error("Supabase not initialized");
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
  },

  async upsertExtraGroup(group: ExtraGroup) {
    if (!supabase) throw new Error("Supabase not initialized");
    
    const groupData: any = {
      name: group.name,
      multi: group.multi,
      required: group.required,
    };

    if (group.id && !group.id.startsWith("temp-")) {
      groupData.id = group.id;
    }

    // 1. Upsert group
    const { data: gData, error: gError } = await supabase
      .from("extra_groups")
      .upsert(groupData)
      .select()
      .single();
    if (gError) throw gError;

    const groupId = gData.id;

    // 2. Manage options (Delete all and re-insert for simplicity, or sync)
    await supabase.from("extra_options").delete().eq("group_id", groupId);
    
    if (group.options.length > 0) {
      const { error: oError } = await supabase.from("extra_options").insert(
        group.options.map((opt) => ({
          group_id: groupId,
          name: opt.name,
          price: opt.price,
        }))
      );
      if (oError) throw oError;
    }

    // 3. Manage category relationships
    await supabase.from("category_extra_groups").delete().eq("group_id", groupId);
    if (group.categoryIds && group.categoryIds.length > 0) {
      const { error: cegError } = await supabase.from("category_extra_groups").insert(
        group.categoryIds.map((catId) => ({
          group_id: groupId,
          category_id: catId,
        }))
      );
      if (cegError) throw cegError;
    }

    // Devuelve el grupo completo con sus opciones y categorías (necesario para el store)
    const { data: finalGroup, error: fError } = await supabase
      .from("extra_groups")
      .select("*, extra_options(*), category_extra_groups(category_id)")
      .eq("id", groupId)
      .single();
    
    if (fError) throw fError;

    return {
      ...finalGroup,
      options: finalGroup.extra_options || [],
      categoryIds: finalGroup.category_extra_groups?.map((ceg: any) => ceg.category_id) || [],
    } as ExtraGroup;
  },

  async deleteExtraGroup(id: string) {
    if (!supabase) throw new Error("Supabase not initialized");
    const { error } = await supabase.from("extra_groups").delete().eq("id", id);
    if (error) throw error;
  },

  async updatePayment(payment: PaymentInfo) {
    if (!supabase) throw new Error("Supabase not initialized");
    const { error } = await supabase.from("payment_info").upsert({
      id: 1,
      alias: payment.alias,
      cvu: payment.cvu,
      account_name: payment.accountName,
      whatsapp: payment.whatsapp,
    });
    if (error) throw error;
  },

  async uploadImage(file: File): Promise<string> {
    if (!supabase) throw new Error("Supabase not initialized");
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `product-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("products").getPublicUrl(filePath);
    return data.publicUrl;
  },
};

