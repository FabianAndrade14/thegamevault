import {
  Component,
  inject
} from '@angular/core';

import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',

  standalone: true,

  imports: [],

  templateUrl: './login.component.html',

  styleUrl: './login.component.scss'
})
export class Login {

  private readonly authService =
    inject(AuthService);

  private readonly router =
    inject(Router);

  loading = false;

  errorMessage = '';

  async loginWithGoogle(): Promise<void> {

    if (this.loading) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {

      await this.authService.loginWithGoogle();

      await this.router.navigate([
        '/dashboard'
      ]);

    } catch (error) {

      console.error(
        'Error iniciando sesión:',
        error
      );

      this.errorMessage =
        'No fue posible iniciar sesión con Google.';

    } finally {

      this.loading = false;

    }

  }

}