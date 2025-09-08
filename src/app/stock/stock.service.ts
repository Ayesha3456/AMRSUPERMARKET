import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { map } from 'rxjs/operators';

export interface Stock {
  id?: number;
  PRODUCT: number;         // Product ID
  CATEGORY: string;
  PRODUCTNAME: string;
  BRANDNAME?: string;
  STOCK: number;
}

@Injectable({ providedIn: 'root' })
export class StockService {
  private apiUrl = 'https://amrsupermarketbackend.onrender.com/api/stock/';
  private refreshSubject = new Subject<void>();
  refresh$ = this.refreshSubject.asObservable();

  constructor(private http: HttpClient) {}

  getStocks(): Observable<Stock[]> {
    return this.http.get<Stock[]>(this.apiUrl);
  }

  getStockByProduct(productId: number): Observable<Stock | null> {
    return this.http.get<Stock>(`${this.apiUrl}${productId}/`).pipe(
      catchError(() => of(null))
    );
  }

  addStock(stock: Stock): Observable<Stock> {
    return this.http.post<Stock>(this.apiUrl, stock);
  }

  updateStock(stock: Stock): Observable<Stock> {
    return this.http.put<Stock>(`${this.apiUrl}${stock.PRODUCT}/`, stock);
  }

  // 🔔 Trigger refresh for all subscribers
  notifyRefresh(): void {
    this.refreshSubject.next();
  }

  getStockByProductName(productName: string): Observable<Stock | null> {
    return this.getStocks().pipe(
      map(stocks => stocks.find(s => s.PRODUCTNAME === productName) || null),
      catchError(() => of(null))
    );
  }
}
