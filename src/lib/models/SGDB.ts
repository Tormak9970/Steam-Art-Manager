/**
 * Copyright (C) 2024 Travis Lane (Tormak)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>
 */
import { requestTimeoutLength } from "@stores/AppState";
import { fetch } from "@tauri-apps/plugin-http";
import type { GridResults, SGDBGame, SGDBGetGameOptions, SGDBImageOptions, SGDBOptions } from "@types";
import { get } from "svelte/store";


export class RequestError extends Error {
  response: Response;

  constructor(message: string, response: Response) {
    super(message);
    this.name = "Request Error"
    this.response = response;
  }
}
/**
 * Tauri compatible wrapper for the SteamGridDB API.
 */
export class SGDB {
  private readonly key: string;
  private readonly baseURL: string;
  private readonly headers: Record<string, any>;

  /**
   * Creates a new SGDB instance.
   * @param options The api key or SGDB options.
   */
  constructor(options: SGDBOptions | string) {
    // Allow passing just the API key as a string
    if (typeof options === "string") {
      options = { key: options };
    }

    this.baseURL = options.baseURL ?? "https://www.steamgriddb.com/api/";
    this.key = options.key ?? "";
    this.headers = {};

    if (options.headers) {
      this.headers = Object.assign({}, options.headers);
    }

    if (this.key) {
      this.headers.Authorization = `Bearer ${this.key}`;
      this.headers.Accept = 'application/json';
    } else {
      process.emitWarning("API Key not provided, some methods won't work.");
    }
  }

  /**
   * Helper function to format query paramters based on the provided options.
   * @param options The query's options.
   * @returns The built query.
   */
  private buildQuery(options: any): { [key: string]: string; } {
    const multiParams = ["styles", "dimensions", "mimes", "types", "platformdata"];
    const singleParams = ["nsfw", "humor", "epilepsy", "oneoftag", "page"];
    const params: any = {};

    multiParams.forEach((queryParam) => {
      if (options[queryParam]?.length) {
        params[queryParam] = options[queryParam].join(",");
      }
    });

    singleParams.forEach((queryParam) => {
      if (typeof options[queryParam] !== "undefined") {
        params[queryParam] = options[queryParam];
      }
    });
    
    return params;
  }

  /**
   * General request function for intereacting with the SteamGridDB api.
   * @param method The http method.
   * @param url The api request url.
   * @param params Optional request parameters.
   * @param formData Optional form data.
   * @param usePublic Whether to use the public api or v2.
   * @returns A promise resolving to the request's result.
   */
  async handleRequest(method: "GET", url: string, params: { [key: string]: string; } = {}, formData = null, usePublic = false): Promise<any> {
    const requestTimeout = get(requestTimeoutLength);
    let strParams: string;

    if (Object.entries(params).length > 0) {
      strParams = "";
      Object.entries(params).forEach(([param, val]) => {
        strParams = strParams.concat(`&${param}=${val}`);
      });
      strParams = strParams.substring(1);
    } else {
      strParams = "";
    }

    let options = {
      headers: this.headers,
      method,
      signal: AbortSignal.timeout(requestTimeout)
    };

    if (formData) {
      options = Object.assign({}, options, { formData: formData });
    }

    let response = await fetch(`${this.baseURL}${usePublic ? "public" : "v2"}${url}${strParams ? `?${strParams}` : ""}`, options);

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        return data;
      } else {
        throw new RequestError(data.errors?.join(", ") ?? "Unknown SteamGridDB error.", response);
      }
    } else {
      throw new RequestError(response.statusText ?? "SteamGridDB error.", response);
    }
  }

  /**
   * Gets a list of possible matches for a query.
   * @param query The search query.
   * @returns A promise resolving to a list of possible matches.
   */
  async searchGame(query: string): Promise<SGDBGame[]> {
    return (await this.handleRequest("GET", `/search/autocomplete/${encodeURIComponent(query)}`)).data;
  }

  /**
   * Gets information for a game.
   * @param options The SGDB request options
   * @param params Optional request parameters.
   * @returns A promise resolving to the game's information.
   */
  async getGame(options: any, params?: SGDBGetGameOptions): Promise<SGDBGame> {
    if (params) {
      return (await this.handleRequest("GET", `/games/${options.type}/${options.id}`, this.buildQuery(params))).data;
    }
    
    return (await this.handleRequest("GET", `/games/${options.type}/${options.id}`)).data;
  }

  /**
   * Gets information for a game given its id.
   * @param id The game's id.
   * @param params Optional request parameters.
   * @returns A promise resolving to the game's information.
   */
  async getGameById(id: number, params?: SGDBGetGameOptions): Promise<SGDBGame> {
    return this.getGame({id: id, type: "id"}, params);
  }

  /**
   * Gets information for a steam game given its id.
   * @param id The game's id.
   * @param params Optional request parameters.
   * @returns A promise resolving to the game's information.
   */
  async getGameBySteamAppId(id: number, params?: SGDBGetGameOptions): Promise<SGDBGame> {
    return this.getGame({id: id, type: "steam"}, params);
  }

  /**
   * Gets grids for a game given its platform and id.
   * @param options The SGDB request options.
   * @returns A promise resolving to the game's grids.
   */
  async getGrids(options: SGDBImageOptions): Promise<GridResults> {
    const results = await this.handleRequest("GET", `/grids/${options.type}/${options.id}`, this.buildQuery(options));
    const grids = results.data.map((img: any) => {
      img.isAnimated = img.thumb.includes('.webm');
      return img;
    });

    return {
      images: grids,
      page: results.page,
      total: results.total,
    };
  }

  /**
   * Gets a list of grids based on the provided game id and filters.
   * @param id The game's id.
   * @param styles List of styles to include.
   * @param dimensions List of dimensions to include.
   * @param mimes List of mimes to include.
   * @param types List of types to include.
   * @param nsfw Whether the result should include nsfw images.
   * @param humor Whether the result should include humor images.
   * @param epilepsy Whether the result should include epilepsy images.
   * @param page The page of results to get.
   * @returns A promise resolving to a list of grids for the desired game matching the provided filters.
   */
  async getGridsById(
    id: number,
    styles?: string[],
    dimensions?: string[],
    mimes?: string[],
    types?: string[],
    nsfw?: string,
    humor?: string,
    epilepsy?: string,
    page?: number
  ): Promise<GridResults> {
    return this.getGrids({
      type: "game",
      id: id,
      styles: styles,
      dimensions: dimensions,
      mimes: mimes,
      types: types,
      nsfw: nsfw,
      humor: humor,
      epilepsy: epilepsy,
      page: page
    });
  }

  /**
   * Gets a list of grids based on the provided steam game id and filters.
   * @param id The game's id.
   * @param styles List of styles to include.
   * @param dimensions List of dimensions to include.
   * @param mimes List of mimes to include.
   * @param types List of types to include.
   * @param nsfw Whether the result should include nsfw images.
   * @param humor Whether the result should include humor images.
   * @param epilepsy Whether the result should include epilepsy images.
   * @param page The page of results to get.
   * @returns A promise resolving to a list of grids for the desired steam game matching the provided filters.
   */
  async getGridsBySteamAppId(
    id: number,
    styles?: string[],
    dimensions?: string[],
    mimes?: string[],
    types?: string[],
    nsfw?: string,
    humor?: string,
    epilepsy?: string,
    page?: number
  ): Promise<GridResults> {
    return this.getGrids({
      type: "steam",
      id: id,
      styles: styles,
      dimensions: dimensions,
      mimes: mimes,
      types: types,
      nsfw: nsfw,
      humor: humor,
      epilepsy: epilepsy,
      page: page
    });
  }

  /**
   * Gets heros for a game given its platform and id.
   * @param options The SGDB request options.
   * @returns A promise resolving to the game's heros.
   */
  async getHeroes(options: SGDBImageOptions): Promise<GridResults> {
    const results = await this.handleRequest("GET", `/heroes/${options.type}/${options.id}`, this.buildQuery(options));

    const grids = results.data.map((img: any) => {
      img.isAnimated = img.thumb.includes('.webm');
      return img;
    });

    return {
      images: grids,
      page: results.page,
      total: results.total,
    };
  }

  /**
   * Gets a list of heroes based on the provided game id and filters.
   * @param id The game's id.
   * @param styles List of styles to include.
   * @param dimensions List of dimensions to include.
   * @param mimes List of mimes to include.
   * @param types List of types to include.
   * @param nsfw Whether the result should include nsfw images.
   * @param humor Whether the result should include humor images.
   * @param epilepsy Whether the result should include epilepsy images.
   * @param page The page of results to get.
   * @returns A promise resolving to a list of heroes for the desired game matching the provided filters.
   */
  async getHeroesById(
    id: number,
    styles?: string[],
    dimensions?: string[],
    mimes?: string[],
    types?: string[],
    nsfw?: string,
    humor?: string,
    epilepsy?: string,
    page?: number
  ): Promise<GridResults> {
    return this.getHeroes({
      type: "game",
      id: id,
      styles: styles,
      dimensions: dimensions,
      mimes: mimes,
      types: types,
      nsfw: nsfw,
      humor: humor,
      epilepsy: epilepsy,
      page: page
    });
  }

  /**
   * Gets a list of heroes based on the provided steam game id and filters.
   * @param id The game's id.
   * @param styles List of styles to include.
   * @param dimensions List of dimensions to include.
   * @param mimes List of mimes to include.
   * @param types List of types to include.
   * @param nsfw Whether the result should include nsfw images.
   * @param humor Whether the result should include humor images.
   * @param epilepsy Whether the result should include epilepsy images.
   * @param page The page of results to get.
   * @returns A promise resolving to a list of heroes for the desired steam game matching the provided filters.
   */
  async getHeroesBySteamAppId(
    id: number,
    styles?: string[],
    dimensions?: string[],
    mimes?: string[],
    types?: string[],
    nsfw?: string,
    humor?: string,
    epilepsy?: string,
    page?: number
  ): Promise<GridResults> {
    return this.getHeroes({
      type: "steam",
      id: id,
      styles: styles,
      dimensions: dimensions,
      mimes: mimes,
      types: types,
      nsfw: nsfw,
      humor: humor,
      epilepsy: epilepsy,
      page: page
    });
  }

  /**
   * Gets icons for a game given its platform and id.
   * @param options The SGDB request options.
   * @returns A promise resolving to the game's icons.
   */
  async getIcons(options: SGDBImageOptions): Promise<GridResults> {
    const results = await this.handleRequest("GET", `/icons/${options.type}/${options.id}`, this.buildQuery(options));

    const grids = results.data.map((img: any) => {
      img.isAnimated = img.thumb.includes('.webm');
      return img;
    });

    return {
      images: grids,
      page: results.page,
      total: results.total,
    };
  }

  /**
   * Gets a list of icons based on the provided game id and filters.
   * @param id The game's id.
   * @param styles List of styles to include.
   * @param dimensions List of dimensions to include.
   * @param mimes List of mimes to include.
   * @param types List of types to include.
   * @param nsfw Whether the result should include nsfw images.
   * @param humor Whether the result should include humor images.
   * @param epilepsy Whether the result should include epilepsy images.
   * @param page The page of results to get.
   * @returns A promise resolving to a list of heroes for the desired game matching the provided filters.
   */
  async getIconsById(
    id: number,
    styles?: string[],
    dimensions?: string[],
    mimes?: string[],
    types?: string[],
    nsfw?: string,
    humor?: string,
    epilepsy?: string,
    page?: number
  ): Promise<GridResults> {
    return this.getIcons({
      type: "game",
      id: id,
      styles: styles,
      dimensions: dimensions,
      mimes: mimes,
      types: types,
      nsfw: nsfw,
      humor: humor,
      epilepsy: epilepsy,
      page: page
    });
  }

  /**
   * Gets a list of icons based on the provided steam game id and filters.
   * @param id The game's id.
   * @param styles List of styles to include.
   * @param dimensions List of dimensions to include.
   * @param mimes List of mimes to include.
   * @param types List of types to include.
   * @param nsfw Whether the result should include nsfw images.
   * @param humor Whether the result should include humor images.
   * @param epilepsy Whether the result should include epilepsy images.
   * @param page The page of results to get.
   * @returns A promise resolving to a list of icons for the desired steam game matching the provided filters.
   */
  async getIconsBySteamAppId(
    id: number,
    styles?: string[],
    dimensions?: string[],
    mimes?: string[],
    types?: string[],
    nsfw?: string,
    humor?: string,
    epilepsy?: string,
    page?: number
  ): Promise<GridResults> {
    return this.getIcons({
      type: "steam",
      id: id,
      styles: styles,
      dimensions: dimensions,
      mimes: mimes,
      types: types,
      nsfw: nsfw,
      humor: humor,
      epilepsy: epilepsy,
      page: page
    });
  }

  /**
   * Gets logos for a game given its platform and id.
   * @param options The SGDB request options.
   * @returns A promise resolving to the game's logos.
   */
  async getLogos(options: SGDBImageOptions): Promise<GridResults> {
    const results = await this.handleRequest("GET", `/logos/${options.type}/${options.id}`, this.buildQuery(options));

    const grids = results.data.map((img: any) => {
      img.isAnimated = img.thumb.includes('.webm');
      return img;
    });

    return {
      images: grids,
      page: results.page,
      total: results.total,
    };
  }

  /**
   * Gets a list of logos based on the provided game id and filters.
   * @param id The game's id.
   * @param styles List of styles to include.
   * @param dimensions List of dimensions to include.
   * @param mimes List of mimes to include.
   * @param types List of types to include.
   * @param nsfw Whether the result should include nsfw images.
   * @param humor Whether the result should include humor images.
   * @param epilepsy Whether the result should include epilepsy images.
   * @param page The page of results to get.
   * @returns A promise resolving to a list of logos for the desired game matching the provided filters.
   */
  async getLogosById(
    id: number,
    styles?: string[],
    dimensions?: string[],
    mimes?: string[],
    types?: string[],
    nsfw?: string,
    humor?: string,
    epilepsy?: string,
    page?: number
  ): Promise<GridResults> {
    return this.getLogos({
      type: "game",
      id: id,
      styles: styles,
      dimensions: dimensions,
      mimes: mimes,
      types: types,
      nsfw: nsfw,
      humor: humor,
      epilepsy: epilepsy,
      page: page
    });
  }

  /**
   * Gets a list of logos based on the provided steam game id and filters.
   * @param id The game's id.
   * @param styles List of styles to include.
   * @param dimensions List of dimensions to include.
   * @param mimes List of mimes to include.
   * @param types List of types to include.
   * @param nsfw Whether the result should include nsfw images.
   * @param humor Whether the result should include humor images.
   * @param epilepsy Whether the result should include epilepsy images.
   * @param page The page of results to get.
   * @returns A promise resolving to a list of logos for the desired steam game matching the provided filters.
   */
  async getLogosBySteamAppId(
    id: number,
    styles?: string[],
    dimensions?: string[],
    mimes?: string[],
    types?: string[],
    nsfw?: string,
    humor?: string,
    epilepsy?: string,
    page?: number
  ): Promise<GridResults> {
    return this.getLogos({
      type: "steam",
      id: id,
      styles: styles,
      dimensions: dimensions,
      mimes: mimes,
      types: types,
      nsfw: nsfw,
      humor: humor,
      epilepsy: epilepsy,
      page: page,
    });
  }
}