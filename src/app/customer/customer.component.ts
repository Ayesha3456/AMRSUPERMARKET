import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NAVBARComponent } from '../navbar/navbar.component';
import { Customer, CustomerService } from './customer.service';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NAVBARComponent],
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent implements OnInit {
  customers: Customer[] | any = [];
  isModalOpen = false;
  isEditMode = false;
  customer: Customer = this.getEmptyCustomer();

  constructor(private customerService: CustomerService) {}

  ngOnInit() {
    this.loadCustomers();
  }

  getEmptyCustomer(): Customer {
    return {
      NAME: '',
      MOBILE_NO: '',
      ADDRESS: '',
      CITY: '',
      TOWN: '',
      PINCODE: undefined
    };
  }

  loadCustomers() {
    this.customerService.getCustomers().subscribe({
      next: (res: Customer[]) => this.customers = res,
      error: (err: any) => console.error('Error loading customers:', err)
    });
  }

  openModal(cust?: Customer) {
    if (cust) {
      this.customer = { ...cust };
      this.isEditMode = true;
    } else {
      this.customer = this.getEmptyCustomer();
      this.isEditMode = false;
    }
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveCustomer() {
    if (this.isEditMode) {
      this.customerService.updateCustomer(this.customer).subscribe(
        (updated: Customer) => {
          const idx = this.customers.findIndex(
            (c: Customer) => c.CUSTOMER_ID === updated.CUSTOMER_ID
          );
          if (idx !== -1) this.customers[idx] = updated;
          this.closeModal();
        },
        (err: any) => console.error('Error updating customer:', err)
      );
    } else {
      this.customerService.addCustomer(this.customer).subscribe(
        (added: Customer) => {
          this.customers.push(added);
          this.closeModal();
        },
        (err: any) => console.error('Error adding customer:', err)
      );
    }
  }  

  deleteCustomer(cust: Customer) {
    if (!cust.CUSTOMER_ID) return;
    if (!confirm(`Delete customer ${cust.NAME}?`)) return;

    this.customerService.deleteCustomer(cust.CUSTOMER_ID).subscribe({
      next: () => this.customers = this.customers.filter((c: { CUSTOMER_ID: number | undefined; }) => c.CUSTOMER_ID !== cust.CUSTOMER_ID),
      error: (err: any) => console.error('Error deleting customer:', err)
    });
  }
}
