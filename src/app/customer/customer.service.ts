import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Customer {
  CUSTOMER_ID?: number;
  NAME: string;
  MOBILE_NO: string;
  ADDRESS?: string;
  CITY?: string;
  TOWN?: string;
  PINCODE?: number;
}

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private apiUrl = 'http://localhost:8000/api/customer/';

  constructor(private http: HttpClient) {}

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.apiUrl);
  }

  addCustomer(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, customer);
  }

  updateCustomer(customer: Customer): Observable<Customer> {
    if (!customer.CUSTOMER_ID) throw new Error('CUSTOMER_ID required');
    return this.http.put<Customer>(`${this.apiUrl}${customer.CUSTOMER_ID}/`, customer);
  }

  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}
