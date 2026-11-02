import { ExperimentalSortMethods, SortMethods, type GameStruct } from "@types";

export function sortGames(games: GameStruct[], method: SortMethods | ExperimentalSortMethods): GameStruct[] {
  switch (method) {
    case SortMethods.ALPHABETICAL:
      return games.sort((a, b) => a.name.localeCompare(b.name));
    case SortMethods.LAST_PLAYED:
      return games.sort((a, b) => (b.lastPlayed ?? 0) - (a.lastPlayed ?? 0));
    case SortMethods.PLAYTIME:
      return games.sort((a, b) => (b.playtime ?? 0) - (a.playtime ?? 0));
    case ExperimentalSortMethods.PURCHASE_DATE:
      return games.sort((a, b) => (b.purchaseDate ?? 0) - (a.purchaseDate ?? 0));
    case ExperimentalSortMethods.RELEASE_DATE:
      return games.sort((a, b) => (b.releaseDate ?? 0) - (a.releaseDate ?? 0));
    case ExperimentalSortMethods.STEAM_REVIEW_SCORE:
      return games.sort((a, b) => (b.steamReviewScore ?? 0) - (a.steamReviewScore ?? 0));
  }
}