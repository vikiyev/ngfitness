import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { UIService } from 'src/app/shared/ui.service';
import { AuthService } from '../auth.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  private loadingSubs: Subscription;
  emailInput = new FormControl('', [Validators.required, Validators.email]);
  passwordInput = new FormControl('', [Validators.required]);

  loginForm = new FormGroup({
    email: this.emailInput,
    password: this.passwordInput,
  });

  constructor(private authService: AuthService, private uiService: UIService) {}

  ngOnInit(): void {
    this.loadingSubs = this.uiService.loadingStateChanged.subscribe(
      (isLoading) => (this.isLoading = isLoading)
    );
  }

  ngOnDestroy(): void {
    if (this.loadingSubs) {
      this.loadingSubs.unsubscribe();
    }
  }

  onSubmit() {
    this.authService.login({
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    });
  }
}
