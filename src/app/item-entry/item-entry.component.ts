import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NAVBARComponent } from '../navbar/navbar.component';
import { ItemEntry, ItemEntryService } from './item-entry.service';
import { Supplier, SupplierService } from '../supplier/supplier.service';
import { PurchaseOrder, PurchaseOrderService } from '../purchase-order/purchase-order.service';
import { StockService, Stock } from '../stock/stock.service';

interface ItemOrder {
  ORDER: number;
  ORDERID: number;
  SUPPLIER_NAME: string;
  SUPPLIER_ID: number;
  PRODUCTNAME: string;
  CATEGORY: string;
  RECEIVED_QUANTITY: number;
  RECEIVED_DATE: string;
  QUANTITY_REQUIRED: number;
  PENDING_QUANTITY: number;
}

@Component({
  selector: 'app-item-entry',
  standalone: true,
  imports: [CommonModule, FormsModule, NAVBARComponent],
  templateUrl: './item-entry.component.html',
  styleUrls: ['./item-entry.component.scss']
})
export class ItemEntryComponent implements OnInit {
  itemOrders: ItemOrder[] = [];
  currentItem: ItemOrder = this.emptyItem();
  suppliers: Supplier[] = [];
  supplierProducts: PurchaseOrder[] = [];
  isModalOpen = false;

  showToast = false;

  constructor(
    private itemEntryService: ItemEntryService,
    private supplierService: SupplierService,
    private purchaseOrderService: PurchaseOrderService,
    private stockService: StockService
  ) {}

  ngOnInit(): void {
    this.loadEntries();
    this.loadSuppliers();
  }

  loadEntries(): void {
    this.itemEntryService.getEntries().subscribe({
      next: (entries: ItemEntry[]) => {
        this.itemOrders = entries.map(e => this.mapEntryToOrder(e));
      },
      error: (err) => console.error('Error loading item entries', err)
    });
  }

  loadSuppliers(): void {
    this.supplierService.getSuppliers().subscribe({
      next: (s) => this.suppliers = s,
      error: (err) => console.error('Error loading suppliers', err)
    });
  }

  openModal(): void {
    this.add();
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  add(): void {
    this.currentItem = this.emptyItem();
    this.supplierProducts = [];
  }

  onSupplierChange(selectedSupplierId: number | string): void {
    const sid = Number(selectedSupplierId) || 0;
    const supplier = this.suppliers.find(s => Number(s.SUPPLIER_ID) === sid);
    if (!supplier) {
      this.supplierProducts = [];
      this.currentItem.SUPPLIER_ID = 0;
      this.currentItem.SUPPLIER_NAME = '';
      return;
    }

    this.currentItem.SUPPLIER_ID = Number(supplier.SUPPLIER_ID);
    this.currentItem.SUPPLIER_NAME = supplier.NAME ?? '';

    this.purchaseOrderService.getOrders().subscribe({
      next: (orders) => {
        this.supplierProducts = orders.filter(o => Number(o.SUPPLIER_ID) === this.currentItem.SUPPLIER_ID);
      },
      error: (err) => {
        console.error('Error fetching purchase orders', err);
        this.supplierProducts = [];
      }
    });
  }

  onProductChange(productName: string | null | undefined): void {
    if (!productName) {
      this.currentItem.ORDERID = 0;
      this.currentItem.ORDER = 0;
      this.currentItem.PRODUCTNAME = '';
      this.currentItem.CATEGORY = '';
      this.currentItem.QUANTITY_REQUIRED = 0;
      this.currentItem.PENDING_QUANTITY = 0;
      return;
    }

    const order = this.supplierProducts.find(o => o.PRODUCTNAME === productName);
    if (!order) return;

    this.currentItem.ORDER = order.ORDERID ?? 0;
    this.currentItem.ORDERID = order.ORDERID ?? 0;
    this.currentItem.PRODUCTNAME = order.PRODUCTNAME ?? '';
    this.currentItem.CATEGORY = order.CATEGORY ?? '';
    this.currentItem.QUANTITY_REQUIRED = Number(order.QUANTITY_REQUIRED ?? 0);
    this.currentItem.RECEIVED_QUANTITY = 0;
    this.currentItem.PENDING_QUANTITY = Number(order.PENDING_QUANTITY ?? this.currentItem.QUANTITY_REQUIRED);
  }

  updatePending(): void {
    const req = Number(this.currentItem.QUANTITY_REQUIRED || 0);
    const rec = Number(this.currentItem.RECEIVED_QUANTITY || 0);
    this.currentItem.PENDING_QUANTITY = req - rec;
  }

  save(): void {
    this.updatePending();
  
    const backendEntry: Omit<ItemEntry, 'id'> = {
      ORDER: this.currentItem.ORDER,
      SUPPLIER_NAME: this.currentItem.SUPPLIER_NAME,
      RECEIVED_QUANTITY: this.currentItem.RECEIVED_QUANTITY,
      RECEIVED_DATE: this.currentItem.RECEIVED_DATE,
      SUPPLIER_ID: this.currentItem.SUPPLIER_ID,
      ORDERED_QUANTITY: this.currentItem.QUANTITY_REQUIRED,
      PENDING_QUANTITY: this.currentItem.PENDING_QUANTITY,
      PRODUCTNAME: this.currentItem.PRODUCTNAME,
      CATEGORY: this.currentItem.CATEGORY
    };
  
    this.itemEntryService.addEntry(backendEntry).subscribe({
      next: (saved) => {
        this.itemOrders.push(this.mapEntryToOrder(saved));
  
        // ✅ Use PRODUCTNAME as key instead of ORDERID
        const productName = this.currentItem.PRODUCTNAME;

        this.stockService.getStockByProductName(productName).subscribe(stock => {
          if (stock) {
            stock.STOCK += this.currentItem.RECEIVED_QUANTITY;
            this.stockService.updateStock(stock).subscribe(() => {
              this.stockService.notifyRefresh();
              this.showStockToast();
            });
          } else {
            const newStock: Stock = {
              PRODUCT: this.currentItem.ORDER,
              PRODUCTNAME: this.currentItem.PRODUCTNAME,
              CATEGORY: this.currentItem.CATEGORY,
              BRANDNAME: '',
              STOCK: this.currentItem.RECEIVED_QUANTITY
            };
            this.stockService.addStock(newStock).subscribe(() => {
              this.stockService.notifyRefresh();
              this.showStockToast();
            });
          }
        });
  
        this.closeModal();
      },
      error: (err) => {
        console.error('Error saving item entry', err);
        alert('Failed to save item. See console for details.');
      }
    });
  }

  private mapEntryToOrder(e: ItemEntry): ItemOrder {
    return {
      ORDER: e.ORDER,
      ORDERID: e.ORDER,
      SUPPLIER_NAME: e.SUPPLIER_NAME,
      RECEIVED_QUANTITY: e.RECEIVED_QUANTITY,
      RECEIVED_DATE: e.RECEIVED_DATE,
      SUPPLIER_ID: e.SUPPLIER_ID,
      QUANTITY_REQUIRED: e.ORDERED_QUANTITY,
      PENDING_QUANTITY: e.PENDING_QUANTITY,
      PRODUCTNAME: e.PRODUCTNAME,
      CATEGORY: e.CATEGORY
    };
  }

  private emptyItem(): ItemOrder {
    return {
      ORDER: 0,
      ORDERID: 0,
      SUPPLIER_NAME: '',
      SUPPLIER_ID: 0,
      PRODUCTNAME: '',
      CATEGORY: '',
      RECEIVED_QUANTITY: 0,
      RECEIVED_DATE: '',
      QUANTITY_REQUIRED: 0,
      PENDING_QUANTITY: 0
    };
  }

  showStockToast(): void {
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }

  hideToast(): void {
    this.showToast = false;
  }
}
