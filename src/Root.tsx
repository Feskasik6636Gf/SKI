import {Composition} from 'remotion';
import {DoodleShort} from './DoodleShort';

export const Root = () => (
  <Composition
    id="Doodle"
    component={DoodleShort}
    durationInFrames={300}
    fps={30}
    width={1080}
    height={1920}
  />
);
