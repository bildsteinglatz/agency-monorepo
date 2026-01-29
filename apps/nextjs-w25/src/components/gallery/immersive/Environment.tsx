import React, { useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import { MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface EnvironmentProps {
    lightValue: number;
    colorValue: number;
}

export const Environment = ({ lightValue, colorValue }: EnvironmentProps) => {
    
    // Load floor texture
    const floorTexture = useLoader(THREE.TextureLoader, '/floor.png');
    
    // Configure texture repeating
    useEffect(() => {
        floorTexture.wrapS = floorTexture.wrapT = THREE.MirroredRepeatWrapping;
        floorTexture.repeat.set(30, 9); 
        floorTexture.colorSpace = THREE.SRGBColorSpace;
    }, [floorTexture]);

    // Calculate colors based on sliders (0-100)
    // Light: 0 (Dark) -> 100 (Bright)
    // Color: 0 (Cool/Blue) -> 100 (Warm/Orange)
    
    // Base intensity
    const intensity = 0.2 + (lightValue / 100) * 1.8; // 0.2 to 2.0
    
    // Wall Color (White -> Grey -> Black)
    // 0 = White
    // 100 = Black
    const wallColor = new THREE.Color().setScalar(1 - Math.min(1, Math.max(0, colorValue) / 100));

    // Light Color (Fixed to slightly warm white for gallery feel, or neutral)
    const lightColor = new THREE.Color("#fffaf0"); // Warm White

    return (
        <>
            <ambientLight intensity={intensity * 0.5} color={lightColor} />
            <pointLight position={[0, 10, 10]} intensity={intensity} color={lightColor} castShadow />
            
            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <MeshReflectorMaterial
                    blur={[300, 100]}
                    resolution={2048}
                    mixBlur={1}
                    mixStrength={40}
                    roughness={1}
                    depthScale={1.2}
                    minDepthThreshold={0.4}
                    maxDepthThreshold={1.4}
                    color={wallColor}
                    metalness={0.5}
                    mirror={0} // Disable mirror for now if performance is an issue, or keep low
                />
            </mesh>

            {/* Back Wall */}
            <mesh position={[0, 0, -5]} receiveShadow>
                <planeGeometry args={[100, 20]} />
                <meshStandardMaterial 
                    color={wallColor}
                    roughness={0.9}
                />
            </mesh>
        </>
    );
};
