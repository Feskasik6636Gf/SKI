import React from 'react';
import * as THREE from 'three';

const INK = '#16161a';

// Меш с чёрным контуром (метод inverted hull)
export const Outlined: React.FC<{
  geometry: React.ReactNode;
  color: string;
  outline?: number;
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
}> = ({geometry, color, outline = 1.07, position, scale = [1, 1, 1], rotation}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh castShadow receiveShadow>
      {geometry}
      <meshToonMaterial color={color} />
    </mesh>
    <mesh scale={outline}>
      {geometry}
      <meshBasicMaterial color={INK} side={THREE.BackSide} />
    </mesh>
  </group>
);

export type Pose = {
  walk: number; // фаза шага (радианы)
  amp: number; // размах ног/рук 0..1
  headTilt: number; // наклон головы вверх (радианы)
  squash: number; // 1 = норма
  armsUp: number; // 0..1 поднять руки
};

const Limb: React.FC<{
  pos: [number, number, number];
  rotZ: number;
  len: number;
  color: string;
  r?: number;
}> = ({pos, rotZ, len, color, r = 0.055}) => (
  <group position={pos} rotation={[0, 0, rotZ]}>
    <Outlined
      geometry={<cylinderGeometry args={[r, r, len, 10]} />}
      color={color}
      outline={1.35}
      position={[0, -len / 2, 0]}
    />
  </group>
);

// Дудл: белое лицо-круг, тело-капсула, ноги-палочки. Смотрит в +X.
export const Doodle: React.FC<{pose: Pose; body?: string}> = ({pose, body = '#ff6b4a'}) => {
  const {walk, amp, headTilt, squash, armsUp} = pose;
  const legA = Math.sin(walk) * 0.9 * amp;
  const armA = -Math.sin(walk) * 0.8 * amp;
  const bob = Math.abs(Math.cos(walk)) * 0.08 * amp;
  const sx = 1 / Math.sqrt(squash);
  return (
    <group rotation={[0, -Math.PI / 2 + Math.PI / 2, 0]} position={[0, bob, 0]} scale={[sx, squash, sx]}>
      {/* ноги */}
      <Limb pos={[0, 0.85, 0.12]} rotZ={legA} len={0.85} color={INK} />
      <Limb pos={[0, 0.85, -0.12]} rotZ={-legA} len={0.85} color={INK} />
      {/* тело */}
      <Outlined
        geometry={<capsuleGeometry args={[0.27, 0.55, 8, 16]} />}
        color={body}
        position={[0, 1.2, 0]}
        outline={1.08}
      />
      {/* руки */}
      <Limb pos={[0, 1.4, 0.33]} rotZ={armA - armsUp * 2.6} len={0.6} color={INK} />
      <Limb pos={[0, 1.4, -0.33]} rotZ={-armA - armsUp * 2.6} len={0.6} color={INK} />
      {/* голова */}
      <group position={[0, 1.95, 0]} rotation={[0, 0, headTilt]}>
        <Outlined geometry={<sphereGeometry args={[0.5, 32, 24]} />} color="#fffdf7" outline={1.06} />
        {/* глаза смотрят в +X */}
        <mesh position={[0.46, 0.08, 0.17]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshBasicMaterial color={INK} />
        </mesh>
        <mesh position={[0.46, 0.08, -0.17]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshBasicMaterial color={INK} />
        </mesh>
      </group>
    </group>
  );
};
