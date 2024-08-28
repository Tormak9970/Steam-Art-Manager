export interface SGDBGame {
  id: number;
  name: string;
  types: string[];
  verified: boolean;
  numResultPages: number;
  external_platform_data?: {
    steam?: { id: string }[]
  }
}

export interface SGDBAuthor {
  name: string;
  steam64: string;
  avatar: URL;
}

export interface GridResults {
  images: SGDBImage[];
  page: number;
  total: number;
}

export interface SGDBImage {
  author: SGDBAuthor;

  id: number;
  url: URL;
  thumb: URL;
  width: number;
  height: number;
  language: string;

  style: string;
  mime: string;
  humor: boolean;
  epilepsy: boolean;
  nsfw: boolean;
  notes: string|null;
  
  isAnimated: boolean;

  downvotes: number;
  upvotes: number;

  lock: boolean;
  // is_deleted: boolean;
}

export interface SGDBOptions {
  key?: string;
  headers?: Record<string, any>;
  baseURL?: string;
}

export interface SGDBImageOptions {
  id: number;
  type: string;
  styles?: string[];
  dimensions?: string[];
  mimes?: string[];
  types?: string[];
  nsfw?: string;
  epilepsy?: string;
  humor?: string;
  oneoftag?: string;
  page?: number;
}

export interface SGDBGetGameOptions {
  platformdata: string[]
}

export interface SGDBGridTotals {
  grids: number,
  heroes: number,
  logos: number,
  icons: number
}

export type TauriRequest = {
  data: string,
  headers: Record<string, string>,
  ok: boolean,
  rawHeaders: Record<string, string[]>,
  status: number,
  url: string
}