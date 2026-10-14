import {
    Injectable,
    inject
} from '@angular/core';

import {
    Firestore,
    Timestamp,
    addDoc,
    collection,
    updateDoc,
    collectionData,
    deleteDoc,
    doc
} from '@angular/fire/firestore';

import {
    Auth
} from '@angular/fire/auth';

import {
    Observable
} from 'rxjs';

import {
    GameStatus,
    VaultGame
} from '../models/vault-game.model';


@Injectable({
    providedIn: 'root'
})
export class VaultService {

    private readonly firestore =
        inject(Firestore);

    private readonly auth =
        inject(Auth);


    private getCurrentUserId(): string {

        const user =
            this.auth.currentUser;

        if (!user) {
            throw new Error(
                'No hay ningún usuario autenticado.'
            );
        }

        return user.uid;
    }


    private getGamesCollection() {

        const uid =
            this.getCurrentUserId();

        return collection(
            this.firestore,
            `users/${uid}/games`
        );

    }


    async addGame(
        game: VaultGame
    ): Promise<string> {

        const gamesCollection =
            this.getGamesCollection();

        const documentReference =
            await addDoc(
                gamesCollection,
                {
                    ...game,
                    createdAt: Timestamp.now()
                }
            );

        return documentReference.id;

    }

    async updateGameStatus(
        gameId: string,
        status: GameStatus
    ): Promise<void> {

        const uid =
            this.getCurrentUserId();

        const gameDocument =
            doc(
                this.firestore,
                `users/${uid}/games/${gameId}`
            );

        await updateDoc(
            gameDocument,
            {
                status,

                purchasedAt:
                    status === 'OWNED'
                        ? Timestamp.now()
                        : null
            }
        );

    }


    getGames(): Observable<VaultGame[]> {

        const gamesCollection =
            this.getGamesCollection();

        return collectionData(
            gamesCollection,
            {
                idField: 'id'
            }
        ) as Observable<VaultGame[]>;

    }

    async deleteGame(
        gameId: string
    ): Promise<void> {

        const uid =
            this.getCurrentUserId();

        const gameDocument =
            doc(
                this.firestore,
                `users/${uid}/games/${gameId}`
            );

        await deleteDoc(
            gameDocument
        );

    }
}