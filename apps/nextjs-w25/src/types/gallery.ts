/**
 * Type definitions for the Immersive Gallery application.
 */

/**
 * Type representing the dimensions of an artwork, used for R3F scaling.
 * Dimensions are stored in centimeters (cm) in the database, but are passed
 * to R3F components divided by 100 (in meters).
 */
export type ArtworkDimensions = {
  width: number; // In CM
  height: number; // In CM
};

/**
 * Type representing the data for a single artwork fetched from Sanity.
 * This structure combines the data needed for display and calculation.
 */
export type ArtworkData = {
  _id: string;
  title: string;
  imageUrl: string; // URL of the primary image
  artist: string;
  year: number;
  technique: string;
  dimensions: ArtworkDimensions; // In CM
  description: string;
};

/**
 * Type for an immutable Vector3 position used in React state for persistence.
 * This is used instead of the mutable Three.js Vector3 class for reliability.
 */
export type PositionArray = [number, number, number]; // [x, y, z] in METERS

/**
 * Type for the persistent state saved in Firestore (Prompt 13).
 */
export type GalleryState = {
  manualPositions: Record<string, PositionArray>;
  activeIds: string[];
  layoutMode: 'classic' | 'manual';
  lightValue: number; // 0 to 100
  colorValue: number; // 0 to 100
  gap: number; // In METERS
};

export type SavedExhibition = {
    id: string;
    name: string;
    createdAt: number;
    state: GalleryState;
};
