import { ExperimentalFilterMethods, FilterMethods, type Collection, type GameStruct } from "@types";

export function filterGames(games: GameStruct[], method: FilterMethods | ExperimentalFilterMethods, value: string, collections: Collection[]): GameStruct[] {  
  if (value === '') {
    return games
  }

  switch (method) {
    case FilterMethods.NAME:
      return games.filter(game => game.name.toLowerCase().includes(value.toLowerCase()));
    case FilterMethods.APP_ID:
      return games.filter(game => game.appid.toString().toLowerCase().includes(value.toLowerCase()));
    case ExperimentalFilterMethods.COLLECTIONS: {
      const appIds = collections.find(collection => collection.id.toString() === value)
      return games.filter(game => appIds?.apps.includes(game.appid));
    }
    case ExperimentalFilterMethods.STORE_CATEGORIES:
      return games.filter(game => game.storeCategories?.includes(parseInt(value)));
    case ExperimentalFilterMethods.STORE_TAGS:
      return games.filter(game => game.storeTags?.includes(parseInt(value)));
    case ExperimentalFilterMethods.STEAM_REVIEW_SCORE:
      return games.filter(game => game.steamReviewScore?.toString().toLowerCase().includes(value.toLowerCase()));
    case ExperimentalFilterMethods.DECK_COMPAT_CATEGORY:
      return games.filter(game => game.steamDeckCompatCategory?.toString() === value);
    case ExperimentalFilterMethods.FRAME_COMPAT_CATEGORY:
      return games.filter(game => game.steamFrameCompatCategory?.toString() === value);
    case ExperimentalFilterMethods.MACHINE_COMPAT_CATEGORY:
      return games.filter(game => game.steamMachineCompatCategory?.toString() === value);
    case ExperimentalFilterMethods.STEAMOS_COMPAT_CATEGORY:
      return games.filter(game => game.steamOSCompatCategory?.toString() === value);
    case ExperimentalFilterMethods.IS_FAMILY_SHARING:
      return games.filter(game => {
        const isFamily = game.isFamilySharing
        return (value === 'yes' ? isFamily : !isFamily)
      });
  }
}