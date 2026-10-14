import { Injectable, inject } from '@angular/core';

import {
  Auth,
  GoogleAuthProvider,
  User,
  signInWithPopup,
  signOut,
  user
} from '@angular/fire/auth';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly auth = inject(Auth);

  readonly user$: Observable<User | null> = user(this.auth);

  async loginWithGoogle(): Promise<User> {

    const provider = new GoogleAuthProvider();

    const credential = await signInWithPopup(
      this.auth,
      provider
    );

    return credential.user;
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

}