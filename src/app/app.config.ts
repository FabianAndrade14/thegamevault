import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideHttpClient(),
    provideFirebaseApp(() => 
      initializeApp({ 
        "projectId": "the-gaming-vault", 
        "appId": "1:152905230522:web:d31caadbeba9c746527a83", 
        "storageBucket": "the-gaming-vault.firebasestorage.app", 
        "apiKey": "AIzaSyCF1m7SLoqzOkybU7Cr3zqZ97dI6H6r6_s", 
        "authDomain": "the-gaming-vault.firebaseapp.com", 
        "messagingSenderId": "152905230522", 
        "measurementId": "G-DQKCTSJEV0", 
        })
      ), 
      
      provideAuth(() => getAuth()),
      provideFirestore(() => getFirestore())
    ]
};
