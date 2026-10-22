"use client";

import CartModal from "@/components/cart/CartModal";

interface CartProviderProps {
  children: React.ReactNode;
}

export default function CartProvider({ children }: CartProviderProps) {
  return (
    <>
      {children}
      <CartModal />
    </>
  );
}
