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
    // Load backwall texture
    const backwallTexture = useLoader(THREE.TextureLoader, '/backwall.png');
    
    // Configure texture repeating
    useEffect(() => {
        floorTexture.wrapS = floorTexture.wrapT = THREE.MirroredRepeatWrapping;
        floorTexture.repeat.set(30, 9); 
        floorTexture.colorSpace = THREE.SRGBColorSpace;
        
        backwallTexture.wrapS = backwallTexture.wrapT = THREE.MirroredRepeatWrapping;
        backwallTexture.repeat.set(30, 9);
        backwallTexture.colorSpace = THREE.SRGBColorSpace;
    }, [floorTexture, backwallTexture]);

    // Calculate colors based on sliders (0-100)
    // Light: 0 (Dark) -> 100 (Bright)
    // Color: 0 (Cool/Blue) -> 100 (Warm/Orange)
    
    // Base intensity
    const intensity = 0.2 + (lightValue / 100) * 1.8; // 0.2 to 2.0
    
    // Color temperature
    // 0 -> Cool (Blueish)
    // 50 -> Neutral (White)
    // 100 -> Warm (Orangeish)
    const colorTemp = new THREE.Color();
    if (colorValue < 50) {
        // Blue to White
        const t = colorValue / 50; // 0 to 1
        colorTemp.setRGB(t, t, 1); // Blueish to White
    } else {
        // White to Orange
        const t = (colorValue - 50) / 50; // 0 to 1
        colorTemp.setRGB(1, 1 - (t * 0.4), 1 - (t * 0.8)); // White to Orangeish
    }

    return (
        <>
            <ambientLight intensity={intensity * 0.5} color={colorTemp} />
            <pointLight position={[0, 10, 10]} intensity={intensity} color={colorTemp} castShadow />
            
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
                    color="#101010"
                    metalness={0.5}
                    mirror={0} // Disable mirror for now if performance is an issue, or keep low
                />
                 <meshStandardMaterial 
                    map={floorTexture} 
                    color={colorTemp}
                    roughness={0.8}
                    metalness={0.2}
                />
            </mesh>

            {/* Back Wall */}
            <mesh position={[0, 0, -5]} receiveShadow>
                <planeGeometry args={[100, 20]} />
                <meshStandardMaterial 
                    map={backwallTexture}
                    color={colorTemp}
                    roughness={0.9}
                />
            </mesh>
        </>
    );
};
