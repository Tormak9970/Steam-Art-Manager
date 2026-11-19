import { ExperimentalFilterMethods, FilterMethods, type GameStruct } from "@types";

export function filterGames(games: GameStruct[], method: FilterMethods | ExperimentalFilterMethods, value: string): GameStruct[] {  
  switch (method) {
    case FilterMethods.NAME:
      return games.filter(game => value === '' || game.name.toLowerCase().includes(value.toLowerCase()));
    case FilterMethods.APP_ID:
      return games.filter(game => value === '' || game.appid.toString().toLowerCase().includes(value.toLowerCase()));
    case ExperimentalFilterMethods.COLLECTIONS:
      return games.filter(game => value === '' || game.appid.toString().toLowerCase().includes(value.toLowerCase()));
    case ExperimentalFilterMethods.STORE_CATEGORIES:
      return games.filter(game => value === '' || game.appid.toString().toLowerCase().includes(value.toLowerCase()));
    case ExperimentalFilterMethods.STORE_TAGS:
      return games.filter(game => value === '' || game.appid.toString().toLowerCase().includes(value.toLowerCase()));
    case ExperimentalFilterMethods.STEAM_REVIEW_SCORE:
      return games.filter(game => value === '' || game.appid.toString().toLowerCase().includes(value.toLowerCase()));
    case ExperimentalFilterMethods.DECK_COMPAT_CATEGORY:
      return games.filter(game => value === '' || game.appid.toString().toLowerCase().includes(value.toLowerCase()));
    case ExperimentalFilterMethods.FRAME_COMPAT_CATEGORY:
      return games.filter(game => value === '' || game.appid.toString().toLowerCase().includes(value.toLowerCase()));
    case ExperimentalFilterMethods.MACHINE_COMPAT_CATEGORY:
      return games.filter(game => value === '' || game.appid.toString().toLowerCase().includes(value.toLowerCase()));
    case ExperimentalFilterMethods.STEAMOS_COMPAT_CATEGORY:
      return games.filter(game => value === '' || game.appid.toString().toLowerCase().includes(value.toLowerCase()));
    case ExperimentalFilterMethods.IS_FAMILY_SHARING:
      return games.filter(game => {
        const isFamily = game.isFamilySharing
        return value === '' || (value === 'yes' ? isFamily : !isFamily)
      });
  }

  return []
}