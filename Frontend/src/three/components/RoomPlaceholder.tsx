import { Grid } from '@react-three/drei';
import { COLORS } from '../config/sceneConfig';

/** Placeholder floor + debug grid. The room GLB replaces this later. */
export function RoomPlaceholder() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color={COLORS.floor} roughness={0.95} />
      </mesh>
      <Grid
        position={[0, 0.02, 0]}
        args={[200, 200]}
        cellSize={4}
        cellThickness={0.6}
        cellColor="#262a3a"
        sectionSize={16}
        sectionThickness={1.1}
        sectionColor="#4a4f68"
        fadeDistance={140}
        fadeStrength={1.5}
        infiniteGrid
      />
    </group>
  );
}
