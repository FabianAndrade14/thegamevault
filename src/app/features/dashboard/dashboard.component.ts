import {
  Component,
  inject
} from '@angular/core';

import {
  AsyncPipe
} from '@angular/common';

import {
  Router
} from '@angular/router';

import {
  BehaviorSubject,
  combineLatest,
  map
} from 'rxjs';

import {
  AuthService
} from '../../core/services/auth.service';

import {
  VaultService
} from '../../core/services/vault.service';

import {
  RawgService
} from '../../core/services/rawg.service';

import {
  VaultGame
} from '../../core/models/vault-game.model';

import {
  RawgGame
} from '../../core/models/rawg-game.model';


type LibraryFilter =
  | 'ALL'
  | 'WISHLIST'
  | 'OWNED';


type ViewMode =
  | 'GRID'
  | 'LIST';


type SortOption =
  | 'NAME_ASC'
  | 'NAME_DESC'
  | 'RELEASE_DESC'
  | 'RELEASE_ASC'
  | 'PLATFORM';


@Component({
  selector: 'app-dashboard',

  standalone: true,

  imports: [
    AsyncPipe
  ],

  templateUrl: './dashboard.html',

  styleUrl: './dashboard.scss'
})
export class Dashboard {

  // ========================================
  // SERVICIOS
  // ========================================

  readonly authService =
    inject(AuthService);

  private readonly vaultService =
    inject(VaultService);

  private readonly rawgService =
    inject(RawgService);

  private readonly router =
    inject(Router);


  // ========================================
  // FIRESTORE
  // ========================================

  readonly games$ =
    this.vaultService.getGames();


  // ========================================
  // ESTADO DE LA INTERFAZ
  // ========================================

  libraryFilter: LibraryFilter =
    'WISHLIST';

  viewMode: ViewMode =
    'GRID';

  sortOption: SortOption =
    'NAME_ASC';

  platformFilter =
    'ALL';


  private readonly libraryFilterSubject =
    new BehaviorSubject<LibraryFilter>(
      this.libraryFilter
    );

  private readonly sortSubject =
    new BehaviorSubject<SortOption>(
      this.sortOption
    );

  private readonly platformFilterSubject =
    new BehaviorSubject<string>(
      this.platformFilter
    );


  // ========================================
  // CONTADORES
  // ========================================

  readonly gameCounts$ =
    this.games$.pipe(

      map(games => ({

        all:
          games.length,

        wishlist:
          games.filter(
            game =>
              game.status === 'WISHLIST'
          ).length,

        owned:
          games.filter(
            game =>
              game.status === 'OWNED'
          ).length

      }))

    );


  // ========================================
  // PLATAFORMAS DISPONIBLES
  // ========================================

  readonly platforms$ =
    this.games$.pipe(

      map(games => {

        const platforms =
          new Set<string>();


        for (const game of games) {

          if (game.platformName) {

            platforms.add(
              game.platformName
            );

          }

        }


        return Array
          .from(platforms)
          .sort(
            (a, b) =>
              a.localeCompare(b)
          );

      })

    );


  // ========================================
  // FILTRADO + ORDENAMIENTO
  // ========================================

  readonly filteredGames$ =
    combineLatest([

      this.games$,

      this.libraryFilterSubject,

      this.platformFilterSubject,

      this.sortSubject

    ]).pipe(

      map(
        ([
          games,
          libraryFilter,
          platformFilter,
          sortOption
        ]) => {

          let result =
            [...games];


          // STATUS

          if (
            libraryFilter !== 'ALL'
          ) {

            result =
              result.filter(
                game =>
                  game.status ===
                  libraryFilter
              );

          }


          // PLATAFORMA

          if (
            platformFilter !== 'ALL'
          ) {

            result =
              result.filter(
                game =>
                  game.platformName ===
                  platformFilter
              );

          }


          // ORDENAMIENTO

          result.sort(
            (a, b) =>
              this.compareGames(
                a,
                b,
                sortOption
              )
          );


          return result;

        }
      )

    );


  // ========================================
  // RAWG
  // ========================================

  searchResults: RawgGame[] = [];

  searching = false;

  searchError = '';

  hasSearched = false;


  // ========================================
  // GUARDAR
  // ========================================

  addingGameId: number | null =
    null;

  saveMessage = '';

  saveError = '';


  // ========================================
  // ACTUALIZAR
  // ========================================

  updatingGameId: string | null =
    null;


  // ========================================
  // ELIMINAR
  // ========================================

  deletingGameId: string | null =
    null;


  // ========================================
  // IMÁGENES
  // ========================================

  profileImageFailed = false;

  searchImageErrors =
    new Set<number>();

  savedImageErrors =
    new Set<number>();


  // ========================================
  // FILTROS
  // ========================================

  setLibraryFilter(
    filter: LibraryFilter
  ): void {

    this.libraryFilter =
      filter;

    this.libraryFilterSubject
      .next(filter);

  }


  setViewMode(
    mode: ViewMode
  ): void {

    this.viewMode =
      mode;

  }


  setSortOption(
    value: string
  ): void {

    const sortOption =
      value as SortOption;

    this.sortOption =
      sortOption;

    this.sortSubject
      .next(sortOption);

  }


  setPlatformFilter(
    value: string
  ): void {

    this.platformFilter =
      value;

    this.platformFilterSubject
      .next(value);

  }


  // ========================================
  // ORDENAMIENTO
  // ========================================

  private compareGames(
    a: VaultGame,
    b: VaultGame,
    sortOption: SortOption
  ): number {

    switch (sortOption) {

      case 'NAME_ASC':

        return a.name.localeCompare(
          b.name
        );


      case 'NAME_DESC':

        return b.name.localeCompare(
          a.name
        );


      case 'PLATFORM':

        return (
          a.platformName.localeCompare(
            b.platformName
          ) ||
          a.name.localeCompare(
            b.name
          )
        );


      case 'RELEASE_DESC':

        return this.compareDates(
          a,
          b,
          true
        );


      case 'RELEASE_ASC':

        return this.compareDates(
          a,
          b,
          false
        );


      default:

        return 0;

    }

  }


  private compareDates(
    a: VaultGame,
    b: VaultGame,
    descending: boolean
  ): number {

    const dateA =
      a.releaseDate
        ? Date.parse(a.releaseDate)
        : null;

    const dateB =
      b.releaseDate
        ? Date.parse(b.releaseDate)
        : null;


    // Juegos sin fecha al final.

    if (
      dateA === null &&
      dateB === null
    ) {

      return a.name.localeCompare(
        b.name
      );

    }


    if (dateA === null) {

      return 1;

    }


    if (dateB === null) {

      return -1;

    }


    return descending
      ? dateB - dateA
      : dateA - dateB;

  }


  // ========================================
  // BUSCAR RAWG
  // ========================================

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

    this.searchError = '';

    this.saveMessage = '';

    this.saveError = '';

    this.searchResults = [];

    this.hasSearched = true;


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


  // ========================================
  // AGREGAR JUEGO
  // ========================================

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

      this.addingGameId = null;

    }

  }


  // ========================================
  // WISHLIST / OWNED
  // ========================================

  async onPurchasedChange(
    game: VaultGame,
    event: Event
  ): Promise<void> {

    if (!game.id) {
      return;
    }


    const input =
      event.target as HTMLInputElement;

    const checked =
      input.checked;


    if (
      this.updatingGameId !== null
    ) {

      input.checked =
        game.status === 'OWNED';

      return;

    }


    this.updatingGameId =
      game.id;

    this.saveMessage = '';

    this.saveError = '';


    try {

      await this.vaultService
        .updateGameStatus(

          game.id,

          checked
            ? 'OWNED'
            : 'WISHLIST'

        );


      this.saveMessage =
        checked
          ? `${game.name} marcado como comprado.`
          : `${game.name} volvió a tu Wishlist.`;

    } catch (error) {

      console.error(
        'Error actualizando juego:',
        error
      );


      input.checked =
        game.status === 'OWNED';


      this.saveError =
        'No fue posible actualizar el juego.';

    } finally {

      this.updatingGameId =
        null;

    }

  }


  // ========================================
  // ELIMINAR
  // ========================================

  async deleteGame(
    game: VaultGame
  ): Promise<void> {

    if (!game.id) {
      return;
    }


    const confirmed =
      window.confirm(
        `¿Seguro que quieres eliminar "${game.name}"?`
      );


    if (!confirmed) {
      return;
    }


    this.deletingGameId =
      game.id;

    this.saveMessage = '';

    this.saveError = '';


    try {

      await this.vaultService
        .deleteGame(game.id);


      this.saveMessage =
        `${game.name} fue eliminado.`;

    } catch (error) {

      console.error(
        'Error eliminando juego:',
        error
      );

      this.saveError =
        'No fue posible eliminar el juego.';

    } finally {

      this.deletingGameId =
        null;

    }

  }


  // ========================================
  // LOGOUT
  // ========================================

  async logout(): Promise<void> {

    await this.authService
      .logout();

    await this.router.navigate([
      '/login'
    ]);

  }


  // ========================================
  // IMÁGENES
  // ========================================

  onProfileImageError(): void {

    this.profileImageFailed =
      true;

  }


  getInitial(
    name: string | null
  ): string {

    return name
      ?.trim()
      .charAt(0)
      .toUpperCase() || 'U';

  }


  onSearchImageError(
    gameId: number
  ): void {

    this.searchImageErrors
      .add(gameId);

  }


  hasSearchImageError(
    gameId: number
  ): boolean {

    return this.searchImageErrors
      .has(gameId);

  }


  onSavedImageError(
    gameId: number
  ): void {

    this.savedImageErrors
      .add(gameId);

  }


  hasSavedImageError(
    gameId: number
  ): boolean {

    return this.savedImageErrors
      .has(gameId);

  }

}