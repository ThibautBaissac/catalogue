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
  thumbnail_path?: string;
  hash: string;
  created_at: string;
}
