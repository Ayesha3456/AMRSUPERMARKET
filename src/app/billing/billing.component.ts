import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BillingService, Product, Billing, Customer, CustomerDTO, CustomerResponse } from './billing.service';
import { NAVBARComponent } from '../navbar/navbar.component';
import { StockService } from '../stock/stock.service';
import { EmployeeService, Employee } from '../employee/employee.service';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NgbModule, NAVBARComponent],
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss']
})
export class BillingComponent implements OnInit {
  products: Product[] = [];
  customers: Customer[] = [];
  employees: Employee[] = [];
  tempBills: Billing[] = [];

  currentBill: Billing = this.clearBill();
  selectedCustomer: Customer | null = null;
  selectedProduct: Product | null = null;
  selectedEmployee: Employee | null = null;

  constructor(
    private billingService: BillingService,
    private modalService: NgbModal,
    private stockService: StockService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit() {
    this.clearBillsTable();
    this.loadProducts();
    this.loadCustomers();
    this.loadEmployees();
  }

  // ---------------- Load Data ----------------
  loadProducts() {
    this.billingService.getProducts().subscribe({
      next: res => this.products = res,
      error: err => console.error(err)
    });
  }

  loadCustomers() {
    this.billingService.getCustomers().subscribe({
      next: res => {
        this.customers = res.map((c: any) => ({
          id: c.CUSTOMER_ID || c.id,
          name: c.NAME || c.name,
          mobile: c.MOBILE_NO || c.mobile
        }));
      },
      error: err => console.error(err)
    });
  }

  loadEmployees() {
    this.employeeService.getEmployees().subscribe({
      next: res => this.employees = res,
      error: err => console.error(err)
    });
  }

  loadBills() {
    this.billingService.getAllBills().subscribe({
      next: res => this.tempBills = res,
      error: err => console.error(err)
    });
  }

  // ---------------- Modal Handling ----------------
  openBillingModal(content: any) {
    this.modalService.open(content, { size: 'lg' });
  }

  openCustomerModal(content: any) {
    this.modalService.open(content, { size: 'md' });
  }

  // ---------------- Add Customer ----------------
  addCustomer(name: string, mobile: string, modal: any) {
    if (!name || !mobile) return;

    const customerDTO: CustomerDTO = { NAME: name, MOBILE_NO: mobile };
    this.billingService.addCustomer(customerDTO).subscribe({
      next: (c: CustomerResponse) => {
        const mappedCustomer: Customer = {
          id: c.CUSTOMER_ID,
          name: c.NAME,
          mobile: c.MOBILE_NO
        };
        this.customers.push(mappedCustomer);
        this.selectedCustomer = mappedCustomer;
        modal.close();
      },
      error: err => console.error('Error adding customer:', err)
    });
  }

  // ---------------- Product Selection ----------------
  onProductSelect(product: Product | null) {
    this.selectedProduct = product;
    if (!product) {
      this.currentBill = this.clearBill();
      return;
    }
    this.currentBill.PRODUCT = product.id;
    this.currentBill.PRODUCTNAME = product.PRODUCTNAME;
    this.currentBill.CATEGORY = product.CATEGORY;
    this.currentBill.PRICE = product.MRP;
    this.currentBill.QUANTITY = 1;
    this.updateTotal();
  }

  updateTotal() {
    const qty = this.currentBill.QUANTITY || 0;
    const price = this.currentBill.PRICE || 0;
    this.currentBill.TOTAL_PRICE = qty * price;
  }

  // ---------------- Save Bill ----------------
  saveBill() {
    if (!this.selectedProduct || !this.selectedCustomer) return;

    const payload: any = {
      PRODUCT: this.currentBill.PRODUCT,
      QUANTITY: this.currentBill.QUANTITY,
      PRICE: this.currentBill.PRICE,
      TOTAL_PRICE: this.currentBill.TOTAL_PRICE,
      BILL_DATE: this.currentBill.BILL_DATE,
      CUSTOMER: this.selectedCustomer.id
    };

    if (this.selectedEmployee) payload.EMPLOYEE = this.selectedEmployee.EMPLOYEE_ID;

    this.billingService.saveBilling(payload).subscribe({
      next: (savedBill: Billing | any) => {
        // Map customer & employee info for table
        savedBill['CUSTOMER_NAME'] = this.selectedCustomer?.name;
        savedBill['CUSTOMER_MOBILE'] = this.selectedCustomer?.mobile;
        savedBill['CUSTOMER_ID'] = this.selectedCustomer?.id;
        savedBill['EMPLOYEE_NAME'] = this.selectedEmployee?.NAME;
        this.tempBills.push(savedBill);

        // Reduce stock
        if (this.selectedProduct) {
          this.stockService.getStockByProductName(this.selectedProduct.PRODUCTNAME).subscribe(stock => {
            if (stock) {
              const qtyToReduce = this.currentBill.QUANTITY || 0;
              if (stock.STOCK < qtyToReduce) {
                alert('Not enough stock available!');
                return;
              }
              stock.STOCK -= qtyToReduce;
              this.stockService.updateStock(stock).subscribe(() => {
                console.log('Stock reduced successfully');
                this.stockService.notifyRefresh();
              });
            }
          });
        }

        this.clearCurrentBill();
      },
      error: err => console.error('Error saving bill:', err)
    });
  }

  // ---------------- Clear Bill ----------------
  clearCurrentBill() {
    this.currentBill = this.clearBill();
    this.selectedCustomer = null;
    this.selectedProduct = null;
    this.selectedEmployee = null;
  }

  clearBillsTable() {
    this.tempBills = [];
  }

  clearBill(): Billing {
    return {
      PRODUCT: undefined,
      PRODUCTNAME: '',
      CATEGORY: '',
      PRICE: 0,
      QUANTITY: 0,
      TOTAL_PRICE: 0,
      BILL_DATE: new Date().toISOString().split('T')[0],
      CUSTOMER_ID: undefined
    };
  }

  // ---------------- Helper ----------------
  getCustomerName(customerId?: number): string {
    return this.customers.find(c => c.id === customerId)?.name || '-';
  }

  getCustomerMobile(customerId?: number): string {
    return this.customers.find(c => c.id === customerId)?.mobile || '-';
  }

  // ---------------- PDF Export ----------------
  downloadCustomerBill(bill: Billing) {
    const doc = new jsPDF();
    const customer = this.customers.find(c => c.id === bill.CUSTOMER_ID);

    doc.text(`Customer Bill - ${bill.BILL_DATE}`, 14, 15);
    doc.text(`Customer: ${customer?.name || '-'}`, 14, 20);
    doc.text(`Mobile: ${customer?.mobile || '-'}`, 14, 25);

    autoTable(doc, {
      startY: 30,
      head: [['Product Name', 'Category', 'Price', 'Quantity', 'Total']],
      body: [[bill.PRODUCTNAME || '', bill.CATEGORY || '', bill.PRICE || 0, bill.QUANTITY || 0, bill.TOTAL_PRICE || 0]]
    });

    doc.text(`Total Amount: ${bill.TOTAL_PRICE || 0}`, 14, 60);
    doc.save(`Customer_Bill_${bill.BILL_NO || new Date().getTime()}.pdf`);
  }

  downloadAllBillsReport() {
    const doc = new jsPDF();
    doc.text('All Billing Report', 14, 15);

    const body = this.tempBills.map(b => {
      const customer = this.customers.find(c => c.id === b.CUSTOMER_ID);
      return [
        b.BILL_NO || '',
        b.PRODUCTNAME || '',
        b.CATEGORY || '',
        b.PRICE || 0,
        b.QUANTITY || 0,
        b.TOTAL_PRICE || 0,
        b.BILL_DATE || '',
        customer?.name || '',
        customer?.mobile || ''
      ];
    });

    autoTable(doc, {
      startY: 20,
      head: [['Bill No','Product','Category','Price','Quantity','Total','Date','Customer','Mobile']],
      body
    });

    doc.save('All_Billing_Report.pdf');
    this.clearBillsTable();
  }
}
