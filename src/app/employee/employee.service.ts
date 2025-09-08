import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Employee {
  EMPLOYEE_ID?: number;
  NAME: string;
  MOBILE_NO: string;
  ADDRESS: string;
  DOB?: string;
  AGE: number;
  DOJ?: string;
  GENDER: string;
  EMAIL_ID: string;
  QUALIFICATION: string;
  DESIGNATION: string;
  BASIC_PAY: number;
  INCENTIVE: number;
  NET_PAY: number;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private apiUrl = 'https://amrsupermarketbackend.onrender.com/api/employee/';

  constructor(private http: HttpClient) { }

  // Get all employees
  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  // Add a new employee
  addEmployee(employee: Employee): Observable<Employee> {
    // Convert empty strings to null for optional fields (DOB, DOJ)
    const payload = { ...employee };
    if (!payload.DOB) payload.DOB = undefined;
    if (!payload.DOJ) payload.DOJ = undefined;

    return this.http.post<Employee>(this.apiUrl, payload);
  }

  // Update an existing employee
  updateEmployee(employee: Employee): Observable<Employee> {
    if (!employee.EMPLOYEE_ID) {
      throw new Error('EMPLOYEE_ID is required for update');
    }

    const payload = { ...employee };
    if (!payload.DOB) payload.DOB = undefined;
    if (!payload.DOJ) payload.DOJ = undefined;

    return this.http.put<Employee>(`${this.apiUrl}${employee.EMPLOYEE_ID}/`, payload);
  }

  // Delete an employee
  deleteEmployee(employeeId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${employeeId}/`);
  }
}
