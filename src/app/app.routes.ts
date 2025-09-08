import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WELCOMEComponent } from './welcome/welcome.component';
import { HOMEComponent } from './home/home.component';
import { LOGINComponent } from './login/login.component';
import { SPLASHSCREENComponent } from './splash-screen/splash-screen.component';
import { PRODUCTComponent } from './product/product.component';
import { STOCKComponent } from './stock/stock.component';
import { SupplierComponent } from './supplier/supplier.component';
import { PurchaseOrderComponent } from './purchase-order/purchase-order.component';
import { ItemEntryComponent } from './item-entry/item-entry.component';
import { ReportsComponent } from './reports/reports.component';
import { EmployeeComponent } from './employee/employee.component';
import { BillingComponent } from './billing/billing.component';
import { CustomerComponent } from './customer/customer.component';

export const routes: Routes = [
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
  { path: 'welcome', component: WELCOMEComponent },
  { path: 'login', component: LOGINComponent },
  { path: 'home', component: HOMEComponent },
  { path: 'splash-screen', component: SPLASHSCREENComponent },
  { path: 'product', component: PRODUCTComponent },
  { path: 'stock', component: STOCKComponent },
  { path: 'supplier', component: SupplierComponent },
  { path: 'purchase', component: PurchaseOrderComponent },
  { path: 'item', component: ItemEntryComponent },
  { path: 'billing', component: BillingComponent },
  { path: 'employee', component: EmployeeComponent },
  { path: 'customer', component: CustomerComponent },
  { path: 'report', component: ReportsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
