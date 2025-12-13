import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { DragControls as DreiDragControls } from 'three/examples/jsm/controls/DragControls.js';
import * as THREE from 'three';
import { ArtworkData, PositionArray } from '@/types';

interface PaintingFrameProps {
    item: ArtworkData;
    position: THREE.Vector3;
    isFocused: boolean;
    onClick: () => void;
    dragEnabled: boolean;
    onDragEnd: (newPosition: PositionArray) => void;
    texture: THREE.Texture;
    isLoading: boolean;
}

export const PaintingFrame = ({ 
    item, 
    position, 
    isFocused, 
    onClick, 
    dragEnabled, 
    onDragEnd, 
    texture, 
    isLoading 
}: PaintingFrameProps) => {
    const groupRef = useRef<THREE.Group>(null);
    const isDragging = useRef(false);
    
    // Explicitly use useThree inside the component for gl and scene
    const { gl, camera } = useThree();

    // Default dimensions if missing (100cm x 100cm)
    const widthCm = item.dimensions?.width || 100;
    const heightCm = item.dimensions?.height || 100;

    const widthMeters = widthCm / 100;
    const heightMeters = heightCm / 100;
    const Z_WALL = -0.1; // Fixed Z position

    // R3F Animation/Positioning
    useFrame(() => {
        if (groupRef.current && !dragEnabled) {
            // Smoothly move the painting towards the calculated target position (lerp)
            groupRef.current.position.lerp(position, 0.1);
        }
    });

    // Drag Handler Setup
    useEffect(() => {
        let dragControlsRef: any | null = null;

        const handleDragStart = () => {
            isDragging.current = true;
        };

        const handleDrag = () => {
            // Ensure Z is always fixed 
            if (groupRef.current) {
                groupRef.current.position.z = Z_WALL; 
            }
        }

        const handleDragEnd = () => {
            if (groupRef.current && onDragEnd) {
                const { x, y, z } = groupRef.current.position;
                onDragEnd([x, y, z] as PositionArray);
            }
            // Reset dragging flag after a short delay to prevent click event
            setTimeout(() => {
                isDragging.current = false;
            }, 200);
        };
        
        if (dragEnabled && groupRef.current) {
            // DragControls needs an array of objects to control
            dragControlsRef = new DreiDragControls([groupRef.current], camera, gl.domElement);
            dragControlsRef.transformGroup = false; 

            dragControlsRef.addEventListener('dragstart', handleDragStart);
            dragControlsRef.addEventListener('drag', handleDrag);
            dragControlsRef.addEventListener('dragend', handleDragEnd);
        }
        
        // Cleanup function for DragControls
        return () => {
            if (dragControlsRef) {
                dragControlsRef.removeEventListener('dragstart', handleDragStart);
                dragControlsRef.removeEventListener('drag', handleDrag);
                dragControlsRef.removeEventListener('dragend', handleDragEnd);
                dragControlsRef.dispose();
            }
        };
    }, [dragEnabled, onDragEnd, gl, camera, Z_WALL]); 

    // Use a group to hold the mesh, ensuring position is set immediately on initial render
    return (
        <group position={position} ref={groupRef} >
            <mesh
                castShadow
                receiveShadow
                onClick={(e) => {
                    if (isDragging.current) return;
                    onClick();
                }}
                onPointerDown={(e) => {
                    if (dragEnabled) {
                        e.stopPropagation();
                    }
                }}
                // Mesh position is relative to the group, initially [0,0,0]
            >
                <boxGeometry args={[widthMeters, heightMeters, 0.05]} />
                {/* Use MeshBasicMaterial to ensure the artwork colors are not affected by lighting (no grey tint) */}
                <meshBasicMaterial map={texture} toneMapped={false} />
                {/* Texture Loading Feedback Overlay */}
                {isLoading && isFocused && (
                    <mesh position={[0, 0, 0.026]} >
                        <planeGeometry args={[widthMeters * 0.98, heightMeters * 0.98]} />
                        <meshBasicMaterial color={'#999999'} transparent opacity={0.7} />
                    </mesh>
                )}
            </mesh>
        </group>
    );
}
