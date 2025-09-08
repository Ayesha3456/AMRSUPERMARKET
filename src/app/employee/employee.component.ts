import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NAVBARComponent } from '../navbar/navbar.component';
import { EmployeeService, Employee } from './employee.service';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NAVBARComponent],
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss']
})
export class EmployeeComponent implements OnInit {
  employees: Employee[] = [];
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  employee: Employee = this.getEmptyEmployee();
  employeeCounter: number = 1;

  constructor(private employeeService: EmployeeService) { }

  ngOnInit() {
    this.loadEmployees();
  }

  getEmptyEmployee(): Employee {
    return {
      NAME: '',
      MOBILE_NO: '',
      ADDRESS: '',
      DOB: '',
      AGE: 0,
      DOJ: '',
      GENDER: '',
      EMAIL_ID: '',
      QUALIFICATION: '',
      DESIGNATION: '',
      BASIC_PAY: 0,
      INCENTIVE: 0,
      NET_PAY: 0
    };
  }

  loadEmployees() {
    this.employeeService.getEmployees().subscribe({
      next: res => this.employees = res,
      error: err => console.error('Error loading employees:', err)
    });
  }

  openModal(emp?: Employee) {
    if (emp) {
      this.employee = { ...emp };
      this.isEditMode = true;
    } else {
      this.employee = this.getEmptyEmployee();
      this.isEditMode = false;
    }
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  updateNetPay() {
    this.employee.NET_PAY = (this.employee.BASIC_PAY || 0) + (this.employee.INCENTIVE || 0);
  }

  saveEmployee() {
    // Ensure all required fields have default values and convert to uppercase
    const payload: Employee = {
      ...this.employee,
      NAME: (this.employee.NAME || 'UNKNOWN').toUpperCase(),
      MOBILE_NO: (this.employee.MOBILE_NO || '0000000000').toUpperCase(),
      ADDRESS: (this.employee.ADDRESS || 'N/A').toUpperCase(),
      GENDER: (this.employee.GENDER || 'NOT_SPECIFIED').toUpperCase(),
      EMAIL_ID: (this.employee.EMAIL_ID || 'UNKNOWN@EXAMPLE.COM').toUpperCase(),
      QUALIFICATION: (this.employee.QUALIFICATION || 'N/A').toUpperCase(),
      DESIGNATION: (this.employee.DESIGNATION || 'STAFF').toUpperCase(),
      DOB: this.employee.DOB || undefined,
      DOJ: this.employee.DOJ || undefined,
      AGE: this.employee.AGE || 0,
      BASIC_PAY: this.employee.BASIC_PAY || 0,
      INCENTIVE: this.employee.INCENTIVE || 0,
      NET_PAY: (this.employee.BASIC_PAY || 0) + (this.employee.INCENTIVE || 0)
    };

    if (this.isEditMode) {
      this.employeeService.updateEmployee(payload).subscribe({
        next: (res) => {
          const index = this.employees.findIndex(e => e.EMPLOYEE_ID === payload.EMPLOYEE_ID);
          if (index !== -1) this.employees[index] = { ...res };
          this.closeModal();
        },
        error: (err) => console.error('Error updating employee:', err)
      });
    } else {
      payload.EMPLOYEE_ID = this.employeeCounter; // assign a new ID
      this.employeeService.addEmployee(payload).subscribe({
        next: (res) => {
          this.employees.push(res);
          this.employeeCounter++;
          this.closeModal();
        },
        error: (err) => console.error('Error adding employee:', err)
      });
    }
  }

  deleteEmployee(emp: Employee) {
    if (!emp.EMPLOYEE_ID) return;
    if (!confirm(`Are you sure you want to delete ${emp.NAME}?`)) return;

    this.employeeService.deleteEmployee(emp.EMPLOYEE_ID).subscribe({
      next: () => this.employees = this.employees.filter(e => e.EMPLOYEE_ID !== emp.EMPLOYEE_ID),
      error: err => console.error('Error deleting employee:', err)
    });
  }
}
