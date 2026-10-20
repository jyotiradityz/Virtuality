import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { CAMERA_FOV, COLORS, TABLE_CENTER } from '../config/sceneConfig';
import { clampPlayerCount, getCameraPose, getSeatAngle, getSeatTransforms } from '../layout/seatLayout';
import { RoomPlaceholder } from './RoomPlaceholder';
import { SeatCube } from './SeatCube';
import { TablePlaceholder } from './TablePlaceholder';
import { TurnCameraRig } from './TurnCameraRig';

interface CoupScene3DProps {
  playerCount: number;
  activeSeatIndex: number;
  freeOrbit: boolean;
}

export function CoupScene3D({ playerCount, activeSeatIndex, freeOrbit }: CoupScene3DProps) {
  const count = clampPlayerCount(playerCount);
  const seats = getSeatTransforms(count);
  const targetAngle = getSeatAngle(activeSeatIndex % count, count);

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: CAMERA_FOV, position: getCameraPose(0).position, near: 0.5, far: 1000 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={[COLORS.background]} />
      <fog attach="fog" args={[COLORS.background, 120, 260]} />

      <hemisphereLight args={['#aab4d8', '#1a1410', 0.9]} />
      <directionalLight position={[40, 90, 30]} intensity={1.4} />
      <pointLight position={[0, 40, 0]} intensity={1200} distance={120} color="#ffd9a0" />

      <RoomPlaceholder />
      <TablePlaceholder />
      {seats.map((seat) => (
        <SeatCube
          key={seat.index}
          transform={seat}
          label={`P${seat.index + 1}`}
          isActive={seat.index === activeSeatIndex % count}
        />
      ))}

      <TurnCameraRig targetAngle={targetAngle} enabled={!freeOrbit} />
      {freeOrbit && (
        <OrbitControls
          makeDefault
          target={TABLE_CENTER}
          enableDamping
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={20}
          maxDistance={150}
        />
      )}
    </Canvas>
  );
}
