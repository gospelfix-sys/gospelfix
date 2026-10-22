"use client";

import { useCallback, useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import axiosInstance from "@/lib/axios/instance";
import { cartItemsAtom, cartModalOpenAtom } from "@/store/atoms/cartAtom";
import { cartTotalPriceSelector } from "@/store/selectors/cartSelector";
import type { CartItem } from "@/types/cart.types";

interface AddToCartInput {
  productId: string;
  optionId: string;
  optionLabel: string;
  price: number;
}

export function useCart() {
  const [items, setItems] = useRecoilState(cartItemsAtom);
  const totalPrice = useRecoilValue(cartTotalPriceSelector);
  const [isOpen, setIsOpen] = useRecoilState(cartModalOpenAtom);
  const isRequestingRef = useRef(false);

  const fetchCart = useCallback(async () => {
    const res = await axiosInstance.get<CartItem[]>("/cart");
    setItems(res.data);
  }, [setItems]);

  const addToCart = useCallback(
    async (input: AddToCartInput) => {
      if (isRequestingRef.current) return;
      isRequestingRef.current = true;
      try {
        await axiosInstance.post("/cart/add", input);
        await fetchCart();
        setIsOpen(true);
      } finally {
        isRequestingRef.current = false;
      }
    },
    [fetchCart, setIsOpen],
  );

  const removeFromCart = useCallback(
    async (cartItemId: string) => {
      const prevItems = items;
      setItems((current) => current.filter((item) => item.id !== cartItemId));
      try {
        await axiosInstance.delete(`/cart/${cartItemId}`);
      } catch (error) {
        setItems(prevItems);
        throw error;
      }
    },
    [items, setItems],
  );

  const removeMultiple = useCallback(
    async (cartItemIds: string[]) => {
      await Promise.all(cartItemIds.map((id) => axiosInstance.delete(`/cart/${id}`)));
      await fetchCart();
    },
    [fetchCart],
  );

  const openCart = useCallback(async () => {
    await fetchCart();
    setIsOpen(true);
  }, [fetchCart, setIsOpen]);

  const closeCart = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  return {
    items,
    totalPrice,
    isOpen,
    addToCart,
    removeFromCart,
    removeMultiple,
    openCart,
    closeCart,
  };
}
