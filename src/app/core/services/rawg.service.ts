import {
  Injectable,
  inject
} from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  environment
} from '../../../environments/environment';

import {
  RawgSearchResponse
} from '../models/rawg-game.model';


@Injectable({
  providedIn: 'root'
})
export class RawgService {

  private readonly http =
    inject(HttpClient);


  searchGames(
    search: string
  ): Observable<RawgSearchResponse> {

    const query =
      search.trim();

    const params =
      new HttpParams()

        .set(
          'key',
          environment.rawgApiKey
        )

        .set(
          'search',
          query
        )

        .set(
          'page_size',
          '12'
        );


    return this.http.get<RawgSearchResponse>(
      `${environment.rawgApiUrl}/games`,
      {
        params
      }
    );

  }

}