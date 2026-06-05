import type { GridTypesMap } from "@types";

export const IMAGE_FADE_OPTIONS = { delay: 0, duration: 500 };

type GridDimensions = {
  widths: GridTypesMap<number>,
  heights: GridTypesMap<number>
}

type GridDimensionsExtended = GridDimensions & {
  padding: number,
  heightOffset: number,
}

export const PREVIEW_GRID_DIMENSIONS: GridDimensions = {
  widths: {
    Capsule: 25,
    "Wide Capsule": 37.5,
    Hero: 59.75,
    Logo: 37.5,
    Icon: 16,
  },
  heights: {
    Capsule: 37.5,
    "Wide Capsule": 18.25,
    Hero: 21.5,
    Logo: 25.25,
    Icon: 16,
  }
}

export const CURRENT_GRID_DIMENSIONS: GridDimensions = {
  widths: {
    Capsule: 12.5,
    "Wide Capsule": 28.75,
    Hero: 42.5,
    Logo: 28.75,
    Icon: 2,
  },
  heights: {
    Capsule: 18.75,
    "Wide Capsule": 13.75,
    Hero: 13.75,
    Logo: 7.625,
    Icon: 2,
  }
}

export const SMALL_GRID_DIMENSIONS: GridDimensionsExtended = {
  widths: {
    Capsule: 6.25,
    "Wide Capsule": 12.5,
    Hero: 22.125,
    Logo: 12.5,
    Icon: 3.75,
  },
  heights: {
    Capsule: 9.375,
    "Wide Capsule": 6,
    Hero: 7.125,
    Logo: 8.375,
    Icon: 3.75,
  },
  padding: 1.25,
  heightOffset: 1.125
}

const MEDIUM_SCALE_FACTOR = 1.6

export const MEDIUM_GRID_DIMENSIONS: GridDimensionsExtended = {
  widths: {
    Capsule: 6.25 * MEDIUM_SCALE_FACTOR,
    "Wide Capsule": 12.5 * MEDIUM_SCALE_FACTOR,
    Hero: 22.125 * MEDIUM_SCALE_FACTOR,
    Logo: 12.5 * MEDIUM_SCALE_FACTOR,
    Icon: 3.75 * MEDIUM_SCALE_FACTOR,
  },
  heights: {
    Capsule: 9.375 * MEDIUM_SCALE_FACTOR,
    "Wide Capsule": 6 * MEDIUM_SCALE_FACTOR,
    Hero: 7.125 * MEDIUM_SCALE_FACTOR,
    Logo: 8.375 * MEDIUM_SCALE_FACTOR,
    Icon: 3.75 * MEDIUM_SCALE_FACTOR,
  },
  padding: 1.25,
  heightOffset: 1.125
}

const LARGE_SCALE_FACTOR = 2.0

export const LARGE_GRID_DIMENSIONS: GridDimensionsExtended = {
  widths: {
    Capsule: 6.25 * LARGE_SCALE_FACTOR,
    "Wide Capsule": 12.5 * LARGE_SCALE_FACTOR,
    Hero: 22.125 * LARGE_SCALE_FACTOR,
    Logo: 12.5 * LARGE_SCALE_FACTOR,
    Icon: 3.75 * LARGE_SCALE_FACTOR,
  },
  heights: {
    Capsule: 9.375 * LARGE_SCALE_FACTOR,
    "Wide Capsule": 6 * LARGE_SCALE_FACTOR,
    Hero: 7.125 * LARGE_SCALE_FACTOR,
    Logo: 8.375 * LARGE_SCALE_FACTOR,
    Icon: 3.75 * LARGE_SCALE_FACTOR,
  },
  padding: 1.25,
  heightOffset: 1.125
}

export const GRID_DIMENSIONS: Record<string, GridDimensionsExtended> = {
  small: SMALL_GRID_DIMENSIONS,
  medium: MEDIUM_GRID_DIMENSIONS,
  large: LARGE_GRID_DIMENSIONS
}

export const CLEAN_CONFLICT_GRID_DIMENSIONS: Record<string, Record<string, number>> = {
  widths: {
    Capsule: 12.5,
    widecapsule: 17.5,
    Hero: 36.625,
    Logo: 18.75,
    Icon: 16,
  },
  heights: {
    Capsule: 18.75,
    widecapsule: 8.375,
    Hero: 13.125,
    Logo: 12.5,
    Icon: 16,
  }
}