import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PurchaseOrder {
  ORDERID?: number;
  CATEGORY: string;
  SUPPLIER_ID: number;
  SUPPLIER_NAME: string;
  PRODUCTNAME: string;
  PRICE?: number;   // 👈 make optional
  QUANTITY_REQUIRED: number;
  TOTAL_PRICE?: number;
  PENDING_QUANTITY?: number;
}

@Injectable({ providedIn: 'root' })
export class PurchaseOrderService {
  private apiUrl = 'https://amrsupermarketbackend.onrender.com/api/purchaseorder/';

  constructor(private http: HttpClient) {}

  getOrders(): Observable<PurchaseOrder[]> {
    return this.http.get<PurchaseOrder[]>(this.apiUrl);
  }

  addOrder(order: PurchaseOrder): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(this.apiUrl, order);
  }

  updateOrder(id: number, order: PurchaseOrder): Observable<PurchaseOrder> {
    return this.http.put<PurchaseOrder>(`${this.apiUrl}${id}/`, order);
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
  
}
