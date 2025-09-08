import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ItemEntry {
  id: number;
  ORDER: number; // foreign key for backend
  ORDERID?: number; // for UI display
  SUPPLIER_NAME: string;
  SUPPLIER_ID: number;
  PRODUCTNAME: string;
  CATEGORY: string;
  RECEIVED_QUANTITY: number;
  RECEIVED_DATE: string;
  ORDERED_QUANTITY: number;
  PENDING_QUANTITY: number;
}

@Injectable({ providedIn: 'root' })
export class ItemEntryService {
  private apiUrl = 'http://localhost:8000/api/itementry/';

  constructor(private http: HttpClient) {}

  getEntries(): Observable<ItemEntry[]> {
    return this.http.get<ItemEntry[]>(this.apiUrl);
  }

  addEntry(entry: Omit<ItemEntry, 'id'>): Observable<ItemEntry> {
    return this.http.post<ItemEntry>(this.apiUrl, entry);
  }

  updateEntry(entry: ItemEntry): Observable<ItemEntry> {
    return this.http.put<ItemEntry>(`${this.apiUrl}${entry.id}/`, entry);
  }

  deleteEntry(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}
