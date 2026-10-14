import {
  Timestamp
} from '@angular/fire/firestore';


export type GameStatus =
  | 'WISHLIST'
  | 'OWNED';


export type GameFormat =
  | 'PHYSICAL'
  | 'DIGITAL';


export type GameCondition =
  | 'SEALED'
  | 'CIB'
  | 'LOOSE';


export type GamePriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH';


export interface VaultGame {

  id?: string;


  // RAWG
  rawgId: number;

  name: string;

  coverUrl: string | null;

  releaseDate: string | null;


  // Plataforma seleccionada
  platformName: string;


  // Tu colección
  status: GameStatus;

  format: GameFormat;

  condition?: GameCondition;

  priority?: GamePriority;


  // Precio
  targetPrice?: number;

  purchasePrice?: number;


  // Coleccionismo
  region?: string;

  purchaseUrl?: string;

  notes?: string;


  createdAt?: Timestamp;
  purchasedAt?: Timestamp | null;

}