import React, { useMemo } from 'react';
import * as THREE from 'three';

export const SizeReferenceFigure = () => {
    // Simple abstract grey material
    const material = useMemo(() => new THREE.MeshStandardMaterial({ color: '#999999', roughness: 0.8 }), []);
    
    return (
        <group position={[3, 0, 5]}> 
            {/* Woman (approx 1.7m tall) */}
            <group position={[0, 0, 0]}>
                {/* Body: Cylinder from y=-2 (floor) up. Height 1.4m. Center at -2 + 0.7 = -1.3 */}
                <mesh position={[0, -1.3, 0]} castShadow receiveShadow material={material}>
                    <cylinderGeometry args={[0.12, 0.18, 1.4, 16]} />
                </mesh>
                {/* Head: Sphere at top. Center at -2 + 1.4 + 0.15 = -0.45 */}
                <mesh position={[0, -0.45, 0]} castShadow receiveShadow material={material}>
                    <sphereGeometry args={[0.14, 16, 16]} />
                </mesh>
            </group>

            {/* Child (approx 1.0m tall) */}
            <group position={[0.4, 0, 0.2]}>
                {/* Body: Height 0.8m. Center at -2 + 0.4 = -1.6 */}
                <mesh position={[0, -1.6, 0]} castShadow receiveShadow material={material}>
                    <cylinderGeometry args={[0.1, 0.12, 0.8, 16]} />
                </mesh>
                {/* Head: Center at -2 + 0.8 + 0.12 = -1.08 */}
                <mesh position={[0, -1.08, 0]} castShadow receiveShadow material={material}>
                    <sphereGeometry args={[0.11, 16, 16]} />
                </mesh>
            </group>
        </group>
    );
};
