import React from 'react';
import {Outlined} from './Doodle';

const Tree: React.FC<{x: number; z: number; s?: number}> = ({x, z, s = 1}) => (
  <group position={[x, 0, z]} scale={s}>
    <Outlined geometry={<cylinderGeometry args={[0.18, 0.24, 1.4, 8]} />} color="#9a6b43" position={[0, 0.7, 0]} />
    <Outlined geometry={<sphereGeometry args={[0.95, 18, 14]} />} color="#5fc46a" position={[0, 1.9, 0]} />
  </group>
);

const House: React.FC<{x: number; z: number; w: number; h: number; d: number; color: string; roof: string}> = ({
  x, z, w, h, d, color, roof,
}) => (
  <group position={[x, 0, z]}>
    <Outlined geometry={<boxGeometry args={[w, h, d]} />} color={color} position={[0, h / 2, 0]} outline={1.025} />
    <Outlined geometry={<boxGeometry args={[w * 1.1, 0.35, d * 1.1]} />} color={roof} position={[0, h + 0.17, 0]} outline={1.04} />
    {[-0.28, 0.28].map((o) => (
      <mesh key={o} position={[o * w, h * 0.6, d / 2 + 0.02]}>
        <planeGeometry args={[w * 0.18, h * 0.2]} />
        <meshBasicMaterial color="#bfe6ff" />
      </mesh>
    ))}
  </group>
);

export const World: React.FC = () => (
  <group>
    {/* трава */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[200, 80]} />
      <meshToonMaterial color="#a8e07a" />
    </mesh>
    {/* дорога */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
      <planeGeometry args={[200, 5]} />
      <meshToonMaterial color="#6d7080" />
    </mesh>
    {/* разметка */}
    {Array.from({length: 40}).map((_, i) => (
      <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-40 + i * 2.4, 0.012, 0]}>
        <planeGeometry args={[1.1, 0.14]} />
        <meshBasicMaterial color="#f7f2d8" />
      </mesh>
    ))}
    {/* дома сзади */}
    <House x={-14} z={-8} w={5} h={4} d={4} color="#ffd36b" roof="#e2574c" />
    <House x={-6} z={-9} w={4} h={5.5} d={4} color="#8fd3ff" roof="#3a6ea5" />
    <House x={2} z={-8.5} w={5.5} h={3.5} d={4} color="#ffb3c7" roof="#7a4b8f" />
    <House x={11} z={-9} w={4.5} h={6} d={4} color="#c6f0a4" roof="#e2574c" />
    <House x={19} z={-8} w={5} h={4.2} d={4} color="#ffd36b" roof="#3a6ea5" />
    <House x={-22} z={-9} w={4.5} h={5} d={4} color="#ffb3c7" roof="#e2574c" />
    {/* деревья */}
    {[-18, -10, -3, 6, 14, 22, -26].map((x, i) => (
      <Tree key={x} x={x} z={i % 2 ? -4.6 : -5.4} s={0.9 + (i % 3) * 0.15} />
    ))}
    {[-16, -4, 9, 20].map((x) => (
      <Tree key={'f' + x} x={x} z={6} s={1.1} />
    ))}
  </group>
);
