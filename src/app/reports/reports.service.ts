import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  constructor(private http: HttpClient) {}

  getBillingReport(): Observable<any[]> {
    return this.http.get<any[]>('/api/billing/');
  }

  getProductReport(): Observable<any[]> {
    return this.http.get<any[]>('/api/product/');
  }

  getPurchaseOrderReport(): Observable<any[]> {
    return this.http.get<any[]>('/api/purchase-orders/');
  }

  getStockReport(): Observable<any[]> {
    return this.http.get<any[]>('/api/stock/');
  }

  getSupplierReport(): Observable<any[]> {
    return this.http.get<any[]>('/api/suppliers/');
  }

  getItemOrderReport(): Observable<any[]> {
    return this.http.get<any[]>('/api/item-orders/');
  }

  getEmployeeReport(): Observable<any[]> {
    return this.http.get<any[]>('/api/employees/');
  }
}
