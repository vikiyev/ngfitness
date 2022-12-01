import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  emailInput = new FormControl('', [Validators.required, Validators.email]);
  passwordInput = new FormControl('', [Validators.required]);

  loginForm = new FormGroup({
    email: this.emailInput,
    password: this.passwordInput,
  });

  constructor() {}

  ngOnInit(): void {}

  onSubmit() {
    console.log(this.loginForm);
  }
}
