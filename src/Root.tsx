import {Composition} from 'remotion';
import {DoodleShort} from './DoodleShort';
import {StyleDemo} from './StyleDemo';

export const Root = () => (
  <>
  <Composition id="StyleDemo" component={StyleDemo} durationInFrames={300} fps={30} width={1080} height={1920} />
  <Composition
    id="Doodle"
    component={DoodleShort}
    durationInFrames={300}
    fps={30}
    width={1080}
    height={1920}
  />
  </>
);
