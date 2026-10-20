import { Html } from '@react-three/drei';
import { COLORS, SEAT_SIZE } from '../config/sceneConfig';
import type { SeatTransform } from '../layout/seatLayout';

interface SeatCubeProps {
  transform: SeatTransform;
  label: string;
  isActive: boolean;
}

/** Placeholder for chair + person. The seat's local +Z faces the table. */
export function SeatCube({ transform, label, isActive }: SeatCubeProps) {
  const { width, height, depth } = SEAT_SIZE;

  return (
    <group position={transform.position} rotation-y={transform.rotationY}>
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={isActive ? COLORS.activeSeat : COLORS.seat}
          emissive={isActive ? COLORS.activeSeatEmissive : '#000000'}
          emissiveIntensity={isActive ? 0.6 : 0}
          roughness={0.55}
        />
      </mesh>

      {/* Front marker on the +Z face: shows which way the seat faces. */}
      <mesh position={[0, height * 0.25, depth / 2 + 0.15]}>
        <boxGeometry args={[width * 0.5, 2, 0.3]} />
        <meshStandardMaterial color={COLORS.frontMarker} roughness={0.4} />
      </mesh>

      <Html position={[0, height / 2 + 3, 0]} center distanceFactor={60} zIndexRange={[10, 0]}>
        <div
          className={`select-none whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wider backdrop-blur-md transition-colors ${
            isActive
              ? 'border-amber-400/70 bg-amber-400/20 text-amber-200'
              : 'border-white/10 bg-black/40 text-slate-300'
          }`}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}
