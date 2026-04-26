import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';
import { OrderService } from './order.service';

function makeHttpMock() {
  return { get: vi.fn(), post: vi.fn() } as any;
}

const mockOrder = {
  id: 'o1', status: 'DELIVERED', grandTotal: 10400,
  orderDate: '2024-03-01T00:00:00Z', paymentMethod: 'CREDIT_CARD', storeName: 'Rolex',
  items: [{ id: 'i1', productName: 'Submariner Date', productSku: 'SUB-001', quantity: 1, price: 10400 }]
};

describe('OrderService', () => {
  let service: OrderService;
  let http: ReturnType<typeof makeHttpMock>;

  beforeEach(() => {
    http = makeHttpMock();
    service = new OrderService(http);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUserOrders — Requirements 7.1, 7.3', () => {
    it('should call GET /api/orders and return OrderResponse[]', () => {
      http.get.mockReturnValue(of([mockOrder]));
      service.getUserOrders().subscribe(orders => {
        expect(orders).toEqual([mockOrder]);
        expect(orders[0].items.length).toBe(1);
      });
      expect(http.get).toHaveBeenCalledWith(expect.stringContaining('/orders'));
    });

    it('should return empty array when no orders', () => {
      http.get.mockReturnValue(of([]));
      service.getUserOrders().subscribe(orders => expect(orders).toEqual([]));
    });
  });

  describe('getOrderById — Requirements 7.2, 7.3', () => {
    it('should call GET /api/orders/o1', () => {
      http.get.mockReturnValue(of(mockOrder));
      service.getOrderById('o1').subscribe(order => {
        expect(order.id).toBe('o1');
        expect(order.items[0].productSku).toBe('SUB-001');
      });
      expect(http.get).toHaveBeenCalledWith(expect.stringContaining('/orders/o1'));
    });
  });
});
