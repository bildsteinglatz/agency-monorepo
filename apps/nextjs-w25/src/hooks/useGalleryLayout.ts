import { useMemo } from 'react';
import * as THREE from 'three';
import { ArtworkData, PositionArray } from '@/types';

const GALLERY_CENTER_Y = 0.00;

export const useGalleryLayout = (
  activeItems: ArtworkData[],
  mode: 'classic' | 'manual',
  gap: number, // In METERS (0.5m default)
  manualPositions: Record<string, PositionArray>
): Record<string, THREE.Vector3> => {
  return useMemo(() => {
    const targetPositions: Record<string, THREE.Vector3> = {};

    if (activeItems.length === 0) {
      return {};
    }

    const activeItemsWithDimensions = activeItems.map(item => ({
      ...item,
      widthMeters: item.dimensions.width / 100,
      heightMeters: item.dimensions.height / 100
    }));

    const totalGapWidth = (activeItems.length > 0 ? activeItems.length - 1 : 0) * gap;
    const totalPaintingWidth = activeItemsWithDimensions.reduce((acc, item) => acc + item.widthMeters, 0);
    const totalLayoutWidth = totalPaintingWidth + totalGapWidth;

    let currentX = -totalLayoutWidth / 2;

    activeItemsWithDimensions.forEach((item) => {
      const id = item._id;

      currentX += item.widthMeters / 2;

      const classicPosition = new THREE.Vector3(currentX, GALLERY_CENTER_Y, -0.1);

      targetPositions[id] = classicPosition;

      currentX += item.widthMeters / 2 + gap;
    });

    if (mode === 'manual') {
        activeItems.forEach(item => {
            if (manualPositions[item._id]) {
                targetPositions[item._id] = new THREE.Vector3(...manualPositions[item._id]);
            }
        });
    }

    return targetPositions;
  }, [activeItems, mode, gap, manualPositions]);
};
