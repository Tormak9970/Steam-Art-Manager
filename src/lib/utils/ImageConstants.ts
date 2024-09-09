import type { GridTypesMap } from "@types";

export const IMAGE_FADE_OPTIONS = { delay: 0, duration: 500 };

type GridDimensions = Record<string, GridTypesMap<number>>

export const PREVIEW_GRID_DIMENSIONS: GridDimensions = {
  "widths": {
    "Capsule": 400,
    "Wide Capsule": 600,
    "Hero": 956,
    "Logo": 600,
    "Icon": 256,
  },
  "heights": {
    "Capsule": 600,
    "Wide Capsule": 291,
    "Hero": 342,
    "Logo": 402,
    "Icon": 256,
  }
}

export const CURRENT_GRID_DIMENSIONS: GridDimensions = {
  "widths": {
    "Capsule": 200,
    "Wide Capsule": 460,
    "Hero": 680,
    "Logo": 460,
    "Icon": 32,
  },
  "heights": {
    "Capsule": 300,
    "Wide Capsule": 215,
    "Hero": 220,
    "Logo": 122,
    "Icon": 32,
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
    "capsule": 200,
    "widecapsule": 280,
    "hero": 586,
    "logo": 300,
    "icon": 256,
  },
  "heights": {
    "capsule": 300,
    "widecapsule": 135,
    "hero": 210,
    "logo": 201,
    "icon": 256,
  }
}