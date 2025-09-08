import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule], // Add FormsModule here
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LOGINComponent {
  username: string = '';
  password: string = '';
  errorMessage: string | null = null;

  constructor(private router: Router) {}

  onSubmit() {
    if (this.username === 'amr' && this.password === 'supermarket') {
      // this.router.navigate(['/home']);
      this.router.navigate(['/splash-screen']);
    } else {
      this.errorMessage = 'Invalid Username or Password';
      this.username = '';
      this.password = '';
    }
  }

  onCancel() {
    this.username = '';
    this.password = '';
  }
}
