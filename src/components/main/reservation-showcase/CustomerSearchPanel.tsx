"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { deriveSearchableCustomers } from "@/lib/reservationDemo/customerHistory";
import type { MockReservation } from "@/types/reservationDemo.types";

const STATUS_LABEL: Record<string, string> = {
  pending: "대기",
  confirmed: "확정",
  changed: "변경",
  cancelled: "취소",
};

interface CustomerSearchPanelProps {
  reservations: MockReservation[];
}

export function CustomerSearchPanel({ reservations }: CustomerSearchPanelProps) {
  const [query, setQuery] = useState("");
  const customers = useMemo(() => deriveSearchableCustomers(reservations), [reservations]);

  const trimmed = query.trim();
  const matches = trimmed ? customers.filter((c) => c.name.includes(trimmed)) : [];
  const quickChips = customers.slice(0, 8);
  const hintNames = customers
    .slice(0, 3)
    .map((c) => c.name)
    .join(", ");

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gf-gray2" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="고객 이름으로 검색 (예: 김민지)"
          aria-label="고객 이름 검색"
          className="h-10 pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {quickChips.map((customer) => (
          <Chip
            key={customer.id}
            onClick={() => setQuery(customer.name)}
            className="border-gf-border px-3 py-1 text-xs font-semibold text-gf-gray2 hover:border-gf-orange hover:text-gf-orange"
          >
            {customer.name}
          </Chip>
        ))}
      </div>

      {trimmed && matches.length === 0 && (
        <p className="text-sm text-gf-gray2">
          일치하는 고객이 없어요. {hintNames}로 검색해보세요.
        </p>
      )}

      {matches.map((customer) => (
        <div key={customer.id} className="flex flex-col gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-gf-black">{customer.name}</span>
            <span className="text-xs text-gf-gray2">{customer.phone}</span>
          </div>

          <ul className="flex flex-col gap-3 border-l border-gf-border pl-4">
            {customer.visits.map((visit) => (
              <li key={`${visit.date}-${visit.service}`} className="relative">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-gf-orange bg-white" />
                <p className="text-sm font-semibold text-gf-black">
                  {visit.service}
                  <span
                    className={cn(
                      "ml-2 text-xs font-bold",
                      visit.status === "cancelled" ? "text-gf-gray2" : "text-gf-orange",
                    )}
                  >
                    {STATUS_LABEL[visit.status]}
                  </span>
                </p>
                <p className="text-xs text-gf-gray2">{visit.date}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
