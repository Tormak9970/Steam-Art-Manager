import type { GridTypesMap } from "@types";

export const IMAGE_FADE_OPTIONS = { delay: 0, duration: 500 };

type GridDimensions = Record<string, GridTypesMap<number>>

export const PREVIEW_GRID_DIMENSIONS: GridDimensions = {
  "widths": {
    "Capsule": 25,
    "Wide Capsule": 37.5,
    "Hero": 59.75,
    "Logo": 37.5,
    "Icon": 16,
  },
  "heights": {
    "Capsule": 37.5,
    "Wide Capsule": 18.25,
    "Hero": 21.5,
    "Logo": 25.25,
    "Icon": 16,
  }
}

export const CURRENT_GRID_DIMENSIONS: GridDimensions = {
  "widths": {
    "Capsule": 12.5,
    "Wide Capsule": 28.75,
    "Hero": 42.5,
    "Logo": 28.75,
    "Icon": 2,
  },
  "heights": {
    "Capsule": 18.75,
    "Wide Capsule": 13.75,
    "Hero": 13.75,
    "Logo": 7.625,
    "Icon": 2,
  }
}

export const SMALL_GRID_DIMENSIONS: GridDimensions = {
  "widths": {
    "Capsule": 100,
    "Wide Capsule": 200,
    "Hero": 353,
    "Logo": 200,
    "Icon": 60,
  },
  "heights": {
    "Capsule": 150,
    "Wide Capsule": 97,
    "Hero": 114,
    "Logo": 134,
    "Icon": 60,
  }
}

export const CLEAN_CONFLICT_GRID_DIMENSIONS: Record<string, Record<string, number>> = {
  "widths": {
    "capsule": 12.5,
    "widecapsule": 17.5,
    "hero": 36.625,
    "logo": 18.75,
    "icon": 16,
  },
  "heights": {
    "capsule": 18.75,
    "widecapsule": 8.375,
    "hero": 13.125,
    "logo": 12.5,
    "icon": 16,
  }
}