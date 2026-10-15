import {
  Component,
  inject
} from '@angular/core';

import {
  RouterLink
} from '@angular/router';

import {
  RawgService
} from '../../core/services/rawg.service';

import {
  VaultService
} from '../../core/services/vault.service';

import {
  RawgGame
} from '../../core/models/rawg-game.model';

import {
  VaultGame
} from '../../core/models/vault-game.model';


@Component({
  selector: 'app-search',

  standalone: true,

  imports: [
    RouterLink
  ],

  templateUrl: './search.component.html',

  styleUrl: './search.component.scss'
})
export class SearchComponent {

  private readonly rawgService =
    inject(RawgService);

  private readonly vaultService =
    inject(VaultService);


  searchResults: RawgGame[] = [];

  searching = false;

  hasSearched = false;

  searchError = '';

  addingGameId: number | null =
    null;

  saveMessage = '';

  saveError = '';


  imageErrors =
    new Set<number>();


  searchGames(
    value: string
  ): void {

    const search =
      value.trim();


    if (!search) {

      this.searchError =
        'Escribe el nombre de un juego.';

      return;

    }


    this.searching = true;

    this.hasSearched = true;

    this.searchError = '';

    this.saveMessage = '';

    this.saveError = '';

    this.searchResults = [];


    this.rawgService
      .searchGames(search)
      .subscribe({

        next: response => {

          this.searchResults =
            response.results;

          this.searching = false;

        },

        error: error => {

          console.error(
            'Error buscando juegos:',
            error
          );

          this.searchError =
            'No fue posible buscar juegos.';

          this.searching = false;

        }

      });

  }


  async addGame(
    rawgGame: RawgGame,
    platformName: string
  ): Promise<void> {

    if (!platformName) {
      return;
    }


    if (
      this.addingGameId !== null
    ) {

      return;

    }


    this.addingGameId =
      rawgGame.id;

    this.saveMessage = '';

    this.saveError = '';


    const game: VaultGame = {

      rawgId:
        rawgGame.id,

      name:
        rawgGame.name,

      coverUrl:
        rawgGame.background_image,

      releaseDate:
        rawgGame.released,

      platformName,

      status:
        'WISHLIST',

      format:
        'PHYSICAL',

      condition:
        'CIB',

      priority:
        'MEDIUM'

    };


    try {

      await this.vaultService
        .addGame(game);


      this.saveMessage =
        `${rawgGame.name} fue agregado a tu Wishlist.`;

    } catch (error) {

      console.error(
        'Error guardando juego:',
        error
      );

      this.saveError =
        'No fue posible guardar el juego.';

    } finally {

      this.addingGameId =
        null;

    }

  }


  onImageError(
    gameId: number
  ): void {

    this.imageErrors.add(
      gameId
    );

  }


  hasImageError(
    gameId: number
  ): boolean {

    return this.imageErrors.has(
      gameId
    );

  }

}