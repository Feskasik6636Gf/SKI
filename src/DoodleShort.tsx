import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {Doodle, Outlined, Pose} from './Doodle';
import {World} from './World';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// --- Таймлайн (секунды) ---
const T_STOP = 3.8; // дудл замечает что-то
const T_BALL_DROP = 4.6; // мяч падает
const T_LAND = 5.5; // мяч приземлился
const T_RUN = 5.7; // дудл бежит

const SPEED_WALK = 1.6;
const SPEED_RUN = 5.2;
const X0 = -4;

const doodleX = (t: number) => {
  if (t < T_STOP) return X0 + t * SPEED_WALK;
  if (t < T_RUN) return X0 + T_STOP * SPEED_WALK;
  const k = t - T_RUN;
  return X0 + T_STOP * SPEED_WALK - k * SPEED_RUN * Math.min(1, k / 0.4 + 0.3);
};

const ballState = (t: number) => {
  const R = 2.2;
  const x0 = 12;
  if (t < T_BALL_DROP) return {x: x0, y: 40, rot: 0, R};
  if (t < T_LAND) {
    const k = (t - T_BALL_DROP) / (T_LAND - T_BALL_DROP);
    return {x: x0, y: R + (1 - k * k) * 30, rot: 0, R};
  }
  // отскок и катится влево
  const k = t - T_LAND;
  const bounce = Math.abs(Math.sin(k * 3.4)) * Math.max(0, 2.2 - k * 0.7);
  const x = x0 - k * 1 - k * k * 2.2;
  return {x, y: R + bounce, rot: (x0 - x) / R, R};
};

const CameraRig: React.FC<{t: number}> = ({t}) => {
  const {camera} = useThree();
  const dx = doodleX(t);
  const shake = t > T_LAND && t < T_LAND + 0.5 ? Math.sin(t * 90) * 0.12 * (1 - (t - T_LAND) / 0.5) : 0;
  // 0..T_STOP: боковой план спереди-сбоку; затем отъезд и слежение
  const wide = interpolate(t, [T_BALL_DROP - 0.4, T_LAND + 0.4], [0, 1], clamp);
  const zoomIn = interpolate(t, [0, T_STOP], [1, 0.8], {...clamp, easing: Easing.inOut(Easing.quad)});
  const camX = dx + interpolate(t, [0, T_STOP], [3.2, 2.4], clamp) + wide * 3.5;
  const camY = 2.2 + wide * 1.5 + shake;
  const camZ = (9 + wide * 5) * zoomIn;
  camera.position.set(camX, camY, camZ);
  camera.lookAt(dx + wide * 1.5, 1.6 + wide * 0.6, 0);
  camera.updateProjectionMatrix();
  return null;
};

const Scene: React.FC<{t: number}> = ({t}) => {
  const dx = doodleX(t);
  const running = t >= T_RUN;
  const walking = t < T_STOP;
  const frozen = !walking && !running;

  const phase = running ? (t - T_RUN) * 16 : t * 7.5;
  const pose: Pose = {
    walk: frozen ? 0 : phase,
    amp: running ? 1.15 : walking ? 0.55 : 0,
    headTilt: frozen
      ? interpolate(t, [T_STOP, T_STOP + 0.3, T_LAND], [0, 0.35, 0.35], clamp)
      : running ? -0.15 : 0,
    squash: frozen && t > T_LAND ? 1 + Math.sin((t - T_LAND) * 30) * 0.05 * Math.max(0, 1 - (t - T_LAND) * 4) : 1,
    armsUp: frozen ? interpolate(t, [T_LAND - 0.2, T_LAND + 0.1], [0, 0.7], clamp) : 0,
  };
  // прыжок на месте при приземлении мяча
  const jump = t > T_LAND - 0.05 && t < T_RUN ? Math.sin(((t - (T_LAND - 0.05)) / (T_RUN - T_LAND + 0.05)) * Math.PI) * 0.5 : 0;

  const ball = ballState(t);
  const markT = interpolate(t, [T_STOP, T_STOP + 0.25], [0, 1], clamp);
  const markVisible = t >= T_STOP && t < T_LAND + 0.2;

  return (
    <>
      <CameraRig t={t} />
      <color attach="background" args={['#bfe9ff']} />
      <fog attach="fog" args={['#bfe9ff', 22, 60]} />
      <ambientLight intensity={1.25} />
      <directionalLight
        position={[dx + 8, 16, 10]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-near={1}
        shadow-camera-far={60}
      />
      <World />
      <group position={[dx, jump, 0.4]}>
        <Doodle pose={pose} />
        {markVisible && (
          <group position={[0, 3.2 + Math.sin(t * 20) * 0.05, 0]} scale={markT}>
            <Outlined geometry={<capsuleGeometry args={[0.12, 0.45, 6, 12]} />} color="#ff3b3b" position={[0, 0.35, 0]} outline={1.25} />
            <Outlined geometry={<sphereGeometry args={[0.14, 12, 12]} />} color="#ff3b3b" position={[0, -0.12, 0]} outline={1.3} />
          </group>
        )}
      </group>
      {/* мяч + тень на земле */}
      <group position={[ball.x, ball.y, 0.4]} rotation={[0, 0, ball.rot]}>
        <Outlined geometry={<sphereGeometry args={[ball.R, 32, 24]} />} color="#ffd23f" outline={1.035} />
        <Outlined geometry={<torusGeometry args={[ball.R * 0.98, 0.08, 8, 40]} />} color="#e2574c" outline={1.2} rotation={[0, 0, 0]} />
        <Outlined geometry={<torusGeometry args={[ball.R * 0.98, 0.08, 8, 40]} />} color="#e2574c" outline={1.2} rotation={[0, Math.PI / 2, 0]} />
      </group>
    </>
  );
};

export const DoodleShort: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = frame / fps;

  const capIn = interpolate(t, [T_STOP + 0.1, T_STOP + 0.4], [0, 1], clamp);
  const capOut = interpolate(t, [T_LAND + 0.3, T_LAND + 0.5], [1, 0], clamp);
  const fade = interpolate(t, [0, 0.3, 9.6, 10], [1, 0, 0, 1], clamp);

  return (
    <AbsoluteFill style={{backgroundColor: '#bfe9ff'}}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows
        camera={{fov: 42, position: [0, 3, 10], near: 0.1, far: 200}}
      >
        <Scene t={t} />
      </ThreeCanvas>
      <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: 220}}>
        <div
          style={{
            fontFamily: 'Arial Black, Impact, sans-serif',
            fontSize: 120,
            color: '#fff',
            WebkitTextStroke: '10px #16161a',
            paintOrder: 'stroke fill',
            transform: `scale(${0.6 + capIn * 0.4}) rotate(${-4 + capIn * 4}deg)`,
            opacity: Math.min(capIn, capOut),
            textAlign: 'center',
          }}
        >
          ЭТО ЧТО?!
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{backgroundColor: '#000', opacity: fade * 0.9, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
