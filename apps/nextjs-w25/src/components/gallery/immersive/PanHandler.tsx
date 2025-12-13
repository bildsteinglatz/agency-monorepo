import React, { useRef } from 'react';
import { useThree, ThreeEvent } from '@react-three/fiber';

interface PanHandlerProps {
    onPan: (deltaX: number, deltaY: number) => void;
}

export const PanHandler = ({ onPan }: PanHandlerProps) => {
    const { size, viewport } = useThree();
    const isDragging = useRef(false);
    const lastPointer = useRef<{x: number, y: number}>({ x: 0, y: 0 });

    const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation(); // Prevent clicking through to other things if needed
        isDragging.current = true;
        lastPointer.current = { x: e.clientX, y: e.clientY };
        document.body.style.cursor = 'grabbing';
    };

    const handlePointerUp = () => {
        isDragging.current = false;
        document.body.style.cursor = 'grab';
    };

    const handlePointerOver = () => {
        document.body.style.cursor = 'grab';
    };

    const handlePointerOut = () => {
        if (!isDragging.current) {
            document.body.style.cursor = 'auto';
        }
    };

    const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
        if (!isDragging.current) return;
        e.stopPropagation();

        const deltaXPixels = e.clientX - lastPointer.current.x;
        const deltaYPixels = e.clientY - lastPointer.current.y;

        // Convert pixels to world units
        // viewport.width is the width of the view in world units at the target depth (0)
        // This is an approximation but good enough for panning
        const deltaXWorld = (deltaXPixels / size.width) * viewport.width;
        const deltaYWorld = (deltaYPixels / size.height) * viewport.height;

        // Invert X because dragging left should move camera right (or scene left)
        // Actually, if we drag mouse left, we want to see what's on the right?
        // Standard pan: drag left -> camera moves right -> view moves left.
        // Let's pass raw deltas and let parent decide direction
        onPan(-deltaXWorld, deltaYWorld); 

        lastPointer.current = { x: e.clientX, y: e.clientY };
    };

    return (
        <mesh 
            position={[0, 0, 0]} 
            visible={false} // Invisible plane to catch events
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerMove={handlePointerMove}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
        >
            <planeGeometry args={[100, 100]} />
        </mesh>
    );
};
