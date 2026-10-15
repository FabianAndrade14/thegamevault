import {
  Component,
  inject
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  AuthService
} from '../../../core/services/auth.service';

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


  // =====================================
  // PARALLAX
  // =====================================

  parallaxX = 0;

  parallaxY = 0;


  // =====================================
  // COVERS
  // =====================================

  readonly coverImages: string[] = [
    'assets/login-covers/1.jpeg',
    'assets/login-covers/2.jpg',
    'assets/login-covers/3.jpg',
    'assets/login-covers/4.webp',
    'assets/login-covers/5.webp',
    'assets/login-covers/6.webp',
    'assets/login-covers/7.jpg',
    'assets/login-covers/8.jpg',
    'assets/login-covers/9.jpg',
    'assets/login-covers/10.jpg',
    'assets/login-covers/11.png',
    'assets/login-covers/12.jpg',
    'assets/login-covers/13.png',
    'assets/login-covers/14.jpg',
    'assets/login-covers/15.jpg',
    'assets/login-covers/16.jpg',
    'assets/login-covers/17.jpg',
    'assets/login-covers/19.jpg',
    'assets/login-covers/20.jpg',
    'assets/login-covers/21.webp',
  ];


  readonly backgroundColumns: string[][] =
    this.createColumns(
      this.coverImages,
      5
    );


  // =====================================
  // LOGIN
  // =====================================

  async loginWithGoogle(): Promise<void> {

    if (this.loading) {
      return;
    }


    this.loading = true;

    this.errorMessage = '';


    try {

      await this.authService
        .loginWithGoogle();


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


  // =====================================
  // PARALLAX
  // =====================================

  onPointerMove(
    event: PointerEvent
  ): void {

    const target =
      event.currentTarget as HTMLElement;


    const rect =
      target.getBoundingClientRect();


    const x =
      (
        event.clientX -
        rect.left
      ) / rect.width;


    const y =
      (
        event.clientY -
        rect.top
      ) / rect.height;


    const normalizedX =
      x - 0.5;


    const normalizedY =
      y - 0.5;


    this.parallaxX =
      normalizedX * 22;


    this.parallaxY =
      normalizedY * 14;

  }


  resetParallax(): void {

    this.parallaxX = 0;

    this.parallaxY = 0;

  }


  // =====================================
  // COLUMNAS
  // =====================================

  private createColumns(
    images: string[],
    totalColumns: number
  ): string[][] {

    const columns: string[][] =
      Array.from(
        {
          length: totalColumns
        },
        () => []
      );


    for (
      let index = 0;
      index < images.length;
      index++
    ) {

      const columnIndex =
        index % totalColumns;


      columns[columnIndex]
        .push(
          images[index]
        );

    }


    return columns.map(
      column => [
        ...column,
        ...column
      ]
    );

  }

}