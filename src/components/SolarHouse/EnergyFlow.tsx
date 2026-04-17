import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { Appliance } from '../../types';
import { SLOT_MAP, FALLBACK_SLOTS } from './ApplianceMarkers';

interface FlowProps {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  speed?: number;
  active?: boolean;
}

const FlowLine = ({ start, end, color, speed = 1, active = true }: FlowProps) => {
  const lineRef = useRef<any>(null);

  // Create Manhattan Waypoints: X -> Z -> Y
  const points = useMemo(() => {
    return [
      new THREE.Vector3(...start),
      new THREE.Vector3(end[0], start[1], start[2]),
      new THREE.Vector3(end[0], start[1], end[2]),
      new THREE.Vector3(...end),
    ];
  }, [start, end]);

  useFrame((state, delta) => {
    if (lineRef.current && active) {
      // Correctly target the material's dashOffset for animation
      lineRef.current.material.dashOffset -= delta * speed * 5;
    }
  });

  if (!active) return null;

  return (
    <Line
      ref={lineRef}
      points={points}
      color={color}
      lineWidth={4.5}
      dashed
      dashScale={5}
      dashArray={[0.2, 0.2]}
      transparent={false}
      opacity={1}
    />
  );
};

export const EnergyFlow = ({
  isSolarActive = true,
  isBatteryDischarging = true,
  hasEV = false,
  appliances = []
}: {
  isSolarActive?: boolean,
  isBatteryDischarging?: boolean,
  hasEV?: boolean,
  appliances?: Appliance[]
}) => {
  // Global World Positions (Transformed from Local House space)
  // These were manually perfected by the user
  const INVERTER_POS: [number, number, number] = [0.4, 1, 3.2];
  const SOLAR_START: [number, number, number] = [0, 8, 1];
  const EV_POS: [number, number, number] = [-4.5, 0.7, 6.0];

  return (
    <group>
      {/* Solar to Inverter/Battery */}
      <FlowLine
        start={SOLAR_START}
        end={INVERTER_POS}
        color="#fbbf24"
        speed={1.0}
        active={isSolarActive}
      />

      {/* Inverter to Main Load (Appliances) */}
      {isBatteryDischarging && appliances.map((app, idx) => {
        const localPos = SLOT_MAP[app.id] || FALLBACK_SLOTS[idx % FALLBACK_SLOTS.length];

        // Use local coordinates directly as we are within the rotated house group
        const endPoint: [number, number, number] = [localPos[0], localPos[1], localPos[2]];

        return (
          <FlowLine
            key={`flow-${app.id}-${idx}`}
            start={INVERTER_POS}
            end={endPoint}
            color="#00f2ff" // High-visibility Electric Cyan
            speed={1.5}
            active={true}
          />
        );
      })}

      {/* Inverter to EV Car */}
      {hasEV && isBatteryDischarging && (
        <FlowLine
          start={INVERTER_POS}
          end={EV_POS}
          color="#10b981"
          speed={2.0}
          active={true}
        />
      )}
    </group>
  );
};
