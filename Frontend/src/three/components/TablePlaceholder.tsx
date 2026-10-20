import { COLORS, TABLE_HALF_SIZE, TABLE_THICKNESS, TABLE_TOP_Y } from '../config/sceneConfig';

/**
 * Placeholder table. The TOP face is exactly y = TABLE_TOP_Y and spans
 * x, z ∈ [-TABLE_HALF_SIZE, TABLE_HALF_SIZE]. The table GLB replaces this later.
 */
export function TablePlaceholder() {
  const side = TABLE_HALF_SIZE * 2;
  const slabCenterY = TABLE_TOP_Y - TABLE_THICKNESS / 2;
  const pedestalHeight = TABLE_TOP_Y - TABLE_THICKNESS;

  return (
    <group>
      <mesh position={[0, slabCenterY, 0]}>
        <boxGeometry args={[side, TABLE_THICKNESS, side]} />
        <meshStandardMaterial color={COLORS.table} roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0, pedestalHeight / 2, 0]}>
        <boxGeometry args={[6, pedestalHeight, 6]} />
        <meshStandardMaterial color={COLORS.tablePedestal} roughness={0.8} />
      </mesh>
    </group>
  );
}
