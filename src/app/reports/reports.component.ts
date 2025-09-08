import { Component, OnInit } from '@angular/core';
import { ReportsService } from './reports.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NAVBARComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, NAVBARComponent],
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  reports = [
    { label: "Billing Report", action: () => this.downloadBillingReport() },
    { label: "Product Report", action: () => this.downloadProductReport() },
    { label: "Purchase Order Report", action: () => this.downloadPurchaseOrderReport() },
    { label: "Stock Report", action: () => this.downloadStockReport() },
    { label: "Supplier Report", action: () => this.downloadSupplierReport() },
    { label: "Item Order Report", action: () => this.downloadItemOrderReport() },
    { label: "Employee Report", action: () => this.downloadEmployeeReport() }
  ];

  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {}

  // PDF download helpers
  private generatePDF(title: string, headers: string[], body: any[][], filename: string) {
    import('jspdf').then(jsPDFModule => {
      import('jspdf-autotable').then(() => {
        const jsPDF = jsPDFModule.default;
        const doc = new jsPDF();
        doc.text(title, 14, 15);
        (window as any).autoTable(doc, { startY: 20, head: [headers], body });
        doc.save(filename);
      });
    });
  }

  downloadBillingReport() {
    this.reportsService.getBillingReport().subscribe(data => {
      const body = data.map(d => [d.BILL_NO, d.CUSTOMER_NAME || '', d.PRODUCTNAME, d.QUANTITY, d.PRICE, d.TOTAL_PRICE]);
      this.generatePDF('Billing Report', ['Bill No','Customer','Product','Qty','Price','Total'], body, 'Billing_Report.pdf');
    });
  }

  downloadProductReport() {
    this.reportsService.getProductReport().subscribe(data => {
      const body = data.map(d => [d.CATEGORY, d.PRODUCTID, d.PRODUCTNAME, d.BRANDNAME, d.STOCK, d.MRP]);
      this.generatePDF('Product Report', ['Category','Product ID','Name','Brand','Stock','MRP'], body, 'Product_Report.pdf');
    });
  }

  downloadPurchaseOrderReport() {
    this.reportsService.getPurchaseOrderReport().subscribe(data => {
      const body = data.map(d => [d.ORDERID, d.CATEGORY, d.SUPPLIER_ID, d.SUPPLIER_NAME, d.PRODUCTNAME, d.PRICE, d.QUANTITY_REQUIRED, d.TOTAL_PRICE]);
      this.generatePDF('Purchase Order Report', ['Order ID','Category','Supplier ID','Supplier Name','Product','Price','Qty','Total'], body, 'PurchaseOrder_Report.pdf');
    });
  }

  downloadStockReport() {
    this.reportsService.getStockReport().subscribe(data => {
      const body = data.map(d => [d.CATEGORY, d.PRODUCT, d.PRODUCTNAME, d.BRANDNAME, d.STOCK]);
      this.generatePDF('Stock Report', ['Category','Product ID','Product Name','Brand','Stock'], body, 'Stock_Report.pdf');
    });
  }

  downloadSupplierReport() {
    this.reportsService.getSupplierReport().subscribe(data => {
      const body = data.map(d => [d.SUPPLIER_ID, d.NAME, d.COMPANY_NAME, d.MOBILE_NO, d.EMAIL_ID, d.CATEGORY]);
      this.generatePDF('Supplier Report', ['Supplier ID','Name','Company','Mobile','Email','Category'], body, 'Supplier_Report.pdf');
    });
  }

  downloadItemOrderReport() {
    this.reportsService.getItemOrderReport().subscribe(data => {
      const body = data.map(d => [d.ORDERID, d.SUPPLIER_NAME, d.RECEIVED_QUANTITY, d.RECEIVED_DATE, d.PRODUCTNAME, d.CATEGORY, d.PENDING_QUANTITY]);
      this.generatePDF('Item Order Report', ['Order ID','Supplier','Received Qty','Received Date','Product','Category','Pending Qty'], body, 'ItemOrder_Report.pdf');
    });
  }

  downloadEmployeeReport() {
    this.reportsService.getEmployeeReport().subscribe(data => {
      const body = data.map(d => [
        d.EMPLOYEE_ID, d.NAME, d.MOBILE_NO, d.ADDRESS, d.DOB, d.AGE, d.DOJ, d.GENDER, d.EMAIL_ID,
        d.QUALIFICATION, d.DESIGNATION, d.BASIC_PAY, d.INCENTIVE, d.NET_PAY
      ]);
      this.generatePDF('Employee Report', ['ID','Name','Mobile','Address','DOB','Age','DOJ','Gender','Email','Qualification','Designation','Basic Pay','Incentive','Net Pay'], body, 'Employee_Report.pdf');
    });
  }
}
