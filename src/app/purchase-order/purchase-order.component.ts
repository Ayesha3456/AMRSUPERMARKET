import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NAVBARComponent } from '../navbar/navbar.component';

import { PurchaseOrderService, PurchaseOrder } from './purchase-order.service';
import { Supplier, SupplierService } from '../supplier/supplier.service';

@Component({
  selector: 'app-purchase-order',
  standalone: true,
  templateUrl: './purchase-order.component.html',
  styleUrls: ['./purchase-order.component.scss'],
  imports: [CommonModule, FormsModule, NAVBARComponent]
})
export class PurchaseOrderComponent implements OnInit {
  orders: PurchaseOrder[] = [];
  order: PurchaseOrder = this.resetOrder();
  suppliers: Supplier[] = [];

  isModalOpen = false;
  editingIndex: number | null = null;

  categories = [
    { id: 1, category: 'SNACKS' },
    { id: 2, category: 'PRODUCE' },
    { id: 3, category: 'FROZEN' },
    { id: 4, category: 'GROCERIES' },
    { id: 5, category: 'HOUSEHOLDS' },
    { id: 6, category: 'PERSONAL CARE' },
  ];

  constructor(
    private purchaseOrderService: PurchaseOrderService,
    private supplierService: SupplierService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    this.loadSuppliers();
  }

  /** 🔹 Normalize backend response */
  private normalizeOrder(raw: any): PurchaseOrder {
    return {
      ORDERID: Number(raw.ORDERID ?? raw.id ?? 0) || undefined,
      CATEGORY: (raw.CATEGORY ?? '').toString().toUpperCase(),
      SUPPLIER_ID: Number(raw.SUPPLIER_ID ?? 0) || 0,
      SUPPLIER_NAME: (raw.SUPPLIER_NAME ?? raw.NAME ?? '').toString().toUpperCase(),
      PRODUCTNAME: (raw.PRODUCTNAME ?? raw.PRODUCT_NAME ?? '').toString().toUpperCase(),
      PRICE: Number(raw.PRICE ?? 0) || 0,
      QUANTITY_REQUIRED: Number(raw.QUANTITY_REQUIRED ?? 0) || 0,
      TOTAL_PRICE: Number(raw.PRICE ?? 0) * Number(raw.QUANTITY_REQUIRED ?? 0),
      PENDING_QUANTITY: Number(raw.PENDING_QUANTITY ?? raw.QUANTITY_REQUIRED ?? 0) || 0
    };
  }

  private loadOrders(): void {
    this.purchaseOrderService.getOrders().subscribe({
      next: (data: any[]) => this.orders = data.map(d => this.normalizeOrder(d)),
      error: err => console.error('Error fetching purchase orders:', err)
    });
  }

  private loadSuppliers(): void {
    this.supplierService.getSuppliers().subscribe({
      next: (s: Supplier[]) => this.suppliers = s,
      error: err => console.error('Error fetching suppliers:', err)
    });
  }

  private resetOrder(): PurchaseOrder {
    return {
      CATEGORY: '',
      SUPPLIER_ID: 0,
      SUPPLIER_NAME: '',
      PRODUCTNAME: '',
      PRICE: 0,
      QUANTITY_REQUIRED: 0,
      TOTAL_PRICE: 0,
      PENDING_QUANTITY: 0
    };
  }

  /** 🔹 Modal Handling */
  openModal(): void {
    this.order = this.resetOrder();
    this.isModalOpen = true;
    this.editingIndex = null;
  }

  editOrder(order: PurchaseOrder, index: number): void {
    this.order = { ...order };
    this.isModalOpen = true;
    this.editingIndex = index;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.editingIndex = null;
    this.order = this.resetOrder();
  }

  /** 🔹 When supplier changes, auto fill supplier ID and optional category */
  onSupplierChange(name: string): void {
    const supplier = this.suppliers.find(s => s.NAME?.toUpperCase() === name.toUpperCase());
    if (supplier) {
      this.order.SUPPLIER_ID = supplier.SUPPLIER_ID;
      this.order.SUPPLIER_NAME = supplier.NAME.toUpperCase();
      // optional auto-fill if supplier has category
      if (supplier.CATEGORY) {
        this.order.CATEGORY = supplier.CATEGORY.toUpperCase();
      }
    }
  }

  /** 🔹 Save order (Add or Update) */
  save(): void {
    this.order.CATEGORY = (this.order.CATEGORY ?? '').toString().toUpperCase();
    this.order.SUPPLIER_NAME = (this.order.SUPPLIER_NAME ?? '').toString().toUpperCase();
    this.order.PRODUCTNAME = (this.order.PRODUCTNAME ?? '').toString().toUpperCase();
    this.order.TOTAL_PRICE = Number(this.order.PRICE) * Number(this.order.QUANTITY_REQUIRED);

    // auto set pending = required initially
    if (!this.order.PENDING_QUANTITY || this.order.PENDING_QUANTITY === 0) {
      this.order.PENDING_QUANTITY = this.order.QUANTITY_REQUIRED;
    }

    if (this.editingIndex !== null && this.order.ORDERID != null) {
      // ✅ Update existing order
      this.purchaseOrderService.updateOrder(this.order.ORDERID, this.order).subscribe({
        next: updated => {
          this.orders[this.editingIndex!] = this.normalizeOrder(updated);
          this.closeModal();
        },
        error: err => console.error('Error updating order:', err)
      });
    } else {
      // ✅ Check for duplicates
      const duplicate = this.orders.find(o =>
        o.SUPPLIER_ID === this.order.SUPPLIER_ID &&
        o.PRODUCTNAME === this.order.PRODUCTNAME
      );

      if (duplicate) {
        alert(
          `⚠️ Duplicate Order: "${this.order.PRODUCTNAME}" already exists for supplier "${this.order.SUPPLIER_NAME}".\n\n👉 Please edit the existing order.`
        );
        return;
      }

      // ✅ Add new order
      this.purchaseOrderService.addOrder(this.order).subscribe({
        next: created => {
          this.orders.push(this.normalizeOrder(created));
          this.closeModal();
        },
        error: err => console.error('Error adding order:', err)
      });
    }
  }

  deleteOrder(index: number): void {
    const order = this.orders[index];
    if (!order.ORDERID) return;

    if (confirm('Are you sure you want to delete this order?')) {
      this.purchaseOrderService.deleteOrder(order.ORDERID).subscribe({
        next: () => this.orders.splice(index, 1),
        error: err => console.error('Error deleting order:', err)
      });
    }
  }
}
