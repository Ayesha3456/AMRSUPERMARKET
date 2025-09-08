import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Product {
  id: number;          // frontend ID mapped from PRODUCTID
  CATEGORY: string;
  PRODUCTNAME: string;
  BRANDNAME: string;
  STOCK: number;
  MRP: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'https://amrsupermarketbackend.onrender.com/api/product/'; // Django REST API endpoint

  constructor(private http: HttpClient) {}

  // Map PRODUCTID to id for frontend
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      map((products: any[]) =>
        products.map(p => ({
          id: p.id,
          CATEGORY: p.CATEGORY,
          PRODUCTNAME: p.PRODUCTNAME,
          BRANDNAME: p.BRANDNAME,
          STOCK: p.STOCK,
          MRP: p.MRP,
        }))
      )
    );
  }

  addProduct(product: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateProduct(product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}${product.id}/`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}
