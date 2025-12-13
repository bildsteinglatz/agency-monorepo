import React, { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const GALLERY_CENTER_Y = 0.00;

interface CameraRigProps {
    focusedId: string | null;
    targetPositions: Record<string, THREE.Vector3>;
    zoom: number;
    pan: [number, number];
}

export const CameraRig = ({ 
    focusedId, 
    targetPositions, 
    zoom, 
    pan 
}: CameraRigProps) => {
    const { camera } = useThree();
    const targetCameraPos = useRef(new THREE.Vector3(0, GALLERY_CENTER_Y, 6)); 
    const targetLookAt = useRef(new THREE.Vector3(0, GALLERY_CENTER_Y, -0.1)); 

    useFrame( () => {
        // Base position is determined by focus or default center
        let baseX = 0;
        let baseY = GALLERY_CENTER_Y;

        if (focusedId && targetPositions[focusedId]) {
            baseX = targetPositions[focusedId].x;
            // We keep Y centered on the gallery center usually, but could follow painting Y if it varies
        }

        // Apply Pan
        const finalX = baseX - pan[0]; // Invert pan for "drag scene" feel, or keep normal for "move camera"
        // Let's assume pan means "move camera", so +panX moves camera right
        const camX = baseX + pan[0];
        // Floor is at y=-2. Limit camera y to be above floor (e.g. -1.5)
        const camY = Math.max(baseY + pan[1], -1.5);
        const camZ = zoom;

        targetCameraPos.current.set(camX, camY, camZ);
        
        // LookAt should also pan? 
        // If we pan the camera, we usually want to look straight ahead.
        // So LookAt X/Y should match Camera X/Y to avoid rotation/tilt.
        targetLookAt.current.set(camX, camY, -0.1);

        // Lerp camera position and lookAt
        camera.position.lerp(targetCameraPos.current, 0.1);
        camera.lookAt(targetLookAt.current.lerp(targetLookAt.current, 0.1));
    });

    return (
        <PerspectiveCamera makeDefault position={[0, GALLERY_CENTER_Y, 6]} fov={50} />
    );
};
