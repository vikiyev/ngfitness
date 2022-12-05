import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../auth.service';
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

  constructor(private authService: AuthService) {}

  ngOnInit(): void {}

  onSubmit() {
    this.authService.login({
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    });
  }
}
