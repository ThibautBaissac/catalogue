export interface Artwork {
  id: number;
  reference: string;
  title?: string;
  description?: string;
  owner?: string | null;
  width?: number;
  height?: number;
  date?: string;
  collection_id?: number | null;
  type_id?: number | null;
  place_id?: number | null;
  preview_image_id?: number | null;
  primaryImage?: ArtworkImage | null;
}

export interface Collection {
  id: number;
  name: string;
  description?: string;
  date?: string;
}

export interface Pigment {
  id: number;
  name: string;
  description?: string;
}

export interface Paper {
  id: number;
  name: string;
  description?: string;
}

export interface Type {
  id: number;
  name: string;
  description?: string;
}

export interface Place {
  id: number;
  name: string;
}

export interface ArtworkImage {
  id: number;
  artwork_id: number;
  file_path: string;
  thumbnail_path?: string | null;
  hash: string;
  created_at: string;
}

export interface ArtworkFilters {
  collectionId?: number;
  typeId?: number;
  placeId?: number;
  pigments?: number[];
  papers?: number[];
  query?: string;
  years?: number[];
  noCollection?: boolean;
  noType?: boolean;
  noPlace?: boolean;
  noPigments?: boolean;
  noPapers?: boolean;
}

export interface ArtworkFull {
  artwork: Artwork;
  pigments: Pigment[];
  papers: Paper[];
  images: ArtworkImage[];
  collection: Collection | null;
  type: Type | null;
  place: Place | null;
}
