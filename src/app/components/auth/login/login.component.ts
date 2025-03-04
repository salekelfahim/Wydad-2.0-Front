import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, AuthenticationRequest } from '../../../services/auth.service';
import {FooterComponent} from "../../../layouts/footer/footer.component";
import {NavbarComponent} from "../../../layouts/navbar/navbar.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FooterComponent, NavbarComponent],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  showPassword = false;
  registrationSuccess = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });

    this.route.queryParams.subscribe(params => {
      if (params['registered'] === 'success') {
        this.registrationSuccess = true;
      }
    });

    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const loginRequest: AuthenticationRequest = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    console.log('Login request payload:', loginRequest); // Log the payload

    this.authService.login(loginRequest).subscribe({
      next: () => {
        this.isSubmitting = false;

        if (this.loginForm.value.rememberMe) {
          localStorage.setItem('remember-user', loginRequest.email);
        } else {
          localStorage.removeItem('remember-user');
        }

        this.router.navigate(['/details']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.error?.message || 'Invalid email or password';
        console.error('Login error:', error); // Log the error
      }
    });
  }


  // Social auth methods (to be implemented with appropriate social auth providers)
  loginWithGoogle(): void {
    // Implement Google login
    console.log('Google login not implemented');
  }

  loginWithFacebook(): void {
    // Implement Facebook login
    console.log('Facebook login not implemented');
  }

  // Helper method for the template
  get f() {
    return this.loginForm.controls;
  }
}
