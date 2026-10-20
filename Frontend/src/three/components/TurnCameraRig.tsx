import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils } from 'three';
import {
  CAMERA_DAMPING,
  CAMERA_HEIGHT,
  CAMERA_RADIUS,
  TABLE_CENTER,
} from '../config/sceneConfig';
import { shortestAngleDelta } from '../layout/seatLayout';

interface TurnCameraRigProps {
  /** Azimuth (radians) of the active seat. */
  targetAngle: number;
  /** When false (Free Orbit), the rig stops driving the camera. */
  enabled: boolean;
}

/**
 * Glides the camera around the table along the shortest arc to behind/above
 * the active seat. Azimuth, radius and height are damped together, so the
 * camera never cuts straight through the table.
 */
export function TurnCameraRig({ targetAngle, enabled }: TurnCameraRigProps) {
  const camera = useThree((state) => state.camera);
  const azimuth = useRef(0);
  const radius = useRef(CAMERA_RADIUS);
  const height = useRef(CAMERA_HEIGHT);

  // On (re)enable, resume from wherever the camera currently is.
  useEffect(() => {
    if (!enabled) return;
    const { x, y, z } = camera.position;
    azimuth.current = Math.atan2(x, z);
    radius.current = Math.hypot(x, z);
    height.current = y;
  }, [enabled, camera]);

  useFrame((_, rawDelta) => {
    if (!enabled) return;
    const delta = Math.min(rawDelta, 0.1); // a backgrounded tab shouldn't teleport the camera

    azimuth.current += shortestAngleDelta(azimuth.current, targetAngle) * (1 - Math.exp(-CAMERA_DAMPING * delta));
    radius.current = MathUtils.damp(radius.current, CAMERA_RADIUS, CAMERA_DAMPING, delta);
    height.current = MathUtils.damp(height.current, CAMERA_HEIGHT, CAMERA_DAMPING, delta);

    camera.position.set(
      Math.sin(azimuth.current) * radius.current,
      height.current,
      Math.cos(azimuth.current) * radius.current,
    );
    camera.lookAt(...TABLE_CENTER);
  });

  return null;
}
