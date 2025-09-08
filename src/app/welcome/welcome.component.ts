import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  imports: [],
  standalone: true,
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WELCOMEComponent {

  constructor(private router: Router){}

  onSubmit(){
    this.router.navigate(['/login'])
  }
}
