import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NAVBARComponent } from '../navbar/navbar.component';
import { SupplierService } from './supplier.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

interface Supplier {
  SUPPLIER_ID: number;
  NAME: string;
  COMPANY_NAME: string;
  MOBILE_NO: string;
  EMAIL_ID: string;
  CATEGORY: string;
}

@Component({
  selector: 'app-supplier',
  standalone: true,
  imports: [CommonModule, FormsModule, NAVBARComponent],
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.scss']
})
export class SupplierComponent implements OnInit {
  suppliers: Supplier[] = [];
  supplier: Supplier = { SUPPLIER_ID: 0, NAME: '', COMPANY_NAME: '', MOBILE_NO: '', EMAIL_ID: '', CATEGORY: '' };
  editing = false;
  message = '';

  constructor(private supplierService: SupplierService, private modalService: NgbModal) {}

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.supplierService.getSuppliers().subscribe({
      next: (res: Supplier[]) => {
        this.suppliers = res;
        this.message = this.suppliers.length === 0 ? 'No suppliers found.' : '';
      },
      error: () => this.message = 'Error loading suppliers!'
    });
  }

  openAddModal(content: any): void {
    this.editing = false;
    this.resetForm();
    this.supplier.SUPPLIER_ID = this.suppliers.length > 0 ? Math.max(...this.suppliers.map(s => s.SUPPLIER_ID)) + 1 : 1;
    this.modalService.open(content, { centered: true, size: 'lg' });
  }

  openEditModal(content: any, s: Supplier): void {
    this.editing = true;
    this.supplier = { ...s };
    this.modalService.open(content, { centered: true, size: 'lg' });
  }

  saveSupplier(): void {
    const data = {
      SUPPLIER_ID: this.supplier.SUPPLIER_ID,
      NAME: this.supplier.NAME.toUpperCase(),
      COMPANY_NAME: this.supplier.COMPANY_NAME.toUpperCase(),
      MOBILE_NO: this.supplier.MOBILE_NO,
      EMAIL_ID: this.supplier.EMAIL_ID,
      CATEGORY: this.supplier.CATEGORY.toUpperCase()
    };

    if (this.editing) {
      this.supplierService.updateSupplier(data).subscribe({
        next: () => {
          this.message = 'Supplier updated successfully!';
          this.loadSuppliers();
          this.modalService.dismissAll();
        },
        error: () => this.message = 'Error updating supplier!'
      });
    } else {
      this.supplierService.addSupplier(data).subscribe({
        next: () => {
          this.message = 'Supplier added successfully!';
          this.loadSuppliers();
          this.modalService.dismissAll();
        },
        error: () => this.message = 'Error adding supplier!'
      });
    }
  }

  cancel(): void {
    this.modalService.dismissAll();
    this.resetForm();
  }

  deleteSupplier(id: number): void {
    if (confirm('Are you sure to delete?')) {
      this.supplierService.deleteSupplier(id).subscribe({
        next: () => {
          this.message = 'Supplier deleted successfully!';
          this.loadSuppliers();
        },
        error: () => this.message = 'Error deleting supplier!'
      });
    }
  }

  resetForm(): void {
    this.supplier = { SUPPLIER_ID: 0, NAME: '', COMPANY_NAME: '', MOBILE_NO: '', EMAIL_ID: '', CATEGORY: '' };
  }
}
