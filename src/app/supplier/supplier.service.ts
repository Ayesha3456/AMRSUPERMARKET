import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Match Django backend fields
export interface Supplier {
  SUPPLIER_ID: number;
  NAME: string;
  COMPANY_NAME: string;
  MOBILE_NO: string;
  EMAIL_ID: string;
  CATEGORY: string;
}

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private apiUrl = 'https://amrsupermarketbackend.onrender.com/api/supplier/';

  constructor(private http: HttpClient) {}

  getSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(this.apiUrl);
  }

  addSupplier(supplier: Omit<Supplier, 'SUPPLIER_ID'>): Observable<Supplier> {
    return this.http.post<Supplier>(this.apiUrl, supplier);
  }

  updateSupplier(supplier: Supplier): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.apiUrl}${supplier.SUPPLIER_ID}/`, supplier);
  }

  deleteSupplier(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}
