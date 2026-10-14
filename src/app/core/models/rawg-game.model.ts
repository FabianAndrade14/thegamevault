export interface RawgPlatform {

  platform: {
    id: number;
    name: string;
    slug: string;
  };

}


export interface RawgGame {

  id: number;

  name: string;

  slug: string;

  released: string | null;

  background_image: string | null;

  rating: number;

  platforms?: RawgPlatform[];

}


export interface RawgSearchResponse {

  count: number;

  next: string | null;

  previous: string | null;

  results: RawgGame[];

}