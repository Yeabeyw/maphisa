import { useEffect, useState, useCallback } from "react";

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string | null;
}

const KEY = "maphisas:cart";

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart:changed"));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(read());
    const onChange = () => setItems(read());
    window.addEventListener("cart:changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("cart:changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const add = useCallback((item: Omit<CartItem, "quantity">, qty = 1) => {
    const current = read();
    const idx = current.findIndex((c) => c.product_id === item.product_id);
    if (idx >= 0) current[idx].quantity += qty;
    else current.push({ ...item, quantity: qty });
    write(current);
  }, []);

  const remove = useCallback((product_id: string) => {
    write(read().filter((c) => c.product_id !== product_id));
  }, []);

  const setQty = useCallback((product_id: string, qty: number) => {
    const current = read()
      .map((c) => (c.product_id === product_id ? { ...c, quantity: Math.max(1, qty) } : c))
      .filter((c) => c.quantity > 0);
    write(current);
  }, []);

  const clear = useCallback(() => write([]), []);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return { items, add, remove, setQty, clear, total, count };
}