import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ---------------- Products ----------------
export interface Product {
  id: number;
  PRODUCTNAME: string;
  BRANDNAME: string;
  CATEGORY: string;
  STOCK: number;
  MRP: number;
}

// ---------------- Customers ----------------
// Request DTO for adding a customer
export interface CustomerDTO {
  NAME: string;
  MOBILE_NO: string;
  ADDRESS?: string;
  CITY?: string;
  TOWN?: string;
  PINCODE?: number;
}

// Response from backend
export interface CustomerResponse {
  CUSTOMER_ID: number;
  NAME: string;
  MOBILE_NO: string;
  ADDRESS?: string;
  CITY?: string;
  TOWN?: string;
  PINCODE?: number;
}

// Frontend UI interface
export interface Customer {
  id: number;
  name: string;
  mobile: string;
}

// ---------------- Billing ----------------
export interface Billing {
  BILL_NO?: number;
  PRODUCT?: number;
  PRODUCTNAME?: string;
  CATEGORY?: string;
  PRICE?: number;
  QUANTITY?: number;
  TOTAL_PRICE?: number;
  BILL_DATE?: string;
  CUSTOMER?: number | null;   // Matches backend FK
  CUSTOMER_ID?: number;        // Optional mapping for UI
  CUSTOMER_NAME?: string;      // Read-only field
  CUSTOMER_MOBILE?: string;    // Read-only field
  PRODUCT_OBJ?: Product | null;
}

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private apiUrl = 'https://amrsupermarketbackend.onrender.com/api'; // Backend API base URL

  constructor(private http: HttpClient) {}

  // ---------------- Customers ----------------
  getCustomers(): Observable<CustomerResponse[]> {
    return this.http.get<CustomerResponse[]>(`${this.apiUrl}/customer/`);
  }

  addCustomer(customer: CustomerDTO): Observable<CustomerResponse> {
    return this.http.post<CustomerResponse>(`${this.apiUrl}/customer/`, customer);
  }

  updateCustomer(customer: CustomerDTO & { CUSTOMER_ID: number }): Observable<CustomerResponse> {
    return this.http.put<CustomerResponse>(`${this.apiUrl}/customer/${customer.CUSTOMER_ID}/`, customer);
  }

  deleteCustomer(customerId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/customer/${customerId}/`);
  }

  // ---------------- Products ----------------
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/product/`);
  }

  // ---------------- Billing ----------------
  getAllBills(): Observable<Billing[]> {
    return this.http.get<Billing[]>(`${this.apiUrl}/billing/`);
  }

  saveBilling(bill: Billing): Observable<Billing> {
    return this.http.post<Billing>(`${this.apiUrl}/billing/`, bill);
  }

  updateBilling(bill: Billing): Observable<Billing> {
    if (!bill.BILL_NO) throw new Error('BILL_NO required for update');
    return this.http.put<Billing>(`${this.apiUrl}/billing/${bill.BILL_NO}/`, bill);
  }

  deleteBilling(billNo: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/billing/${billNo}/`);
  }
}
