import { MOCK_CUSTOMERS } from "@/lib/reservationDemo/mockData";
import type { MockCustomer, MockCustomerVisit, MockReservation } from "@/types/reservationDemo.types";

// "고객 검색" 탭이 예약 현황(reservations)과 완전히 분리된 정적 목업만 보여주면, 챗봇/폼으로
// 방금 새로 예약한 고객은 검색해도 나오지 않는다. 기존 방문 히스토리 시드에 실제
// reservations를 합쳐서, 오늘 새로 접수된 예약도 그 자리에서 바로 검색되게 한다.
export function deriveSearchableCustomers(reservations: MockReservation[]): MockCustomer[] {
  const customerMap = new Map<string, MockCustomer>();

  for (const customer of MOCK_CUSTOMERS) {
    customerMap.set(customer.name, { ...customer, visits: [...customer.visits] });
  }

  for (const reservation of reservations) {
    const visit: MockCustomerVisit = {
      date: reservation.requestedAt,
      service: reservation.service,
      status: reservation.status,
    };

    const existing = customerMap.get(reservation.customerName);
    if (existing) {
      existing.visits = [visit, ...existing.visits];
    } else {
      customerMap.set(reservation.customerName, {
        id: reservation.id,
        name: reservation.customerName,
        phone: "010-****-____",
        visits: [visit],
      });
    }
  }

  return Array.from(customerMap.values());
}
