import { SortMethods, type GameStruct } from "@types";

export function sortGames(games: GameStruct[], method: SortMethods): GameStruct[] {
  switch (method) {
    case SortMethods.ALPHABETICAL:
      return games.sort((a, b) => a.name.localeCompare(b.name));
    case SortMethods.LAST_PLAYED:
      return games.sort((a, b) => (b.lastPlayed ?? 0) - (a.lastPlayed ?? 0));
    case SortMethods.PLAYTIME:
      return games.sort((a, b) => (b.playtime ?? 0) - (a.playtime ?? 0));
  }
}