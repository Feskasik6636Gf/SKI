import {Composition} from 'remotion';
import {DoodleShort} from './DoodleShort';
import {StyleDemo} from './StyleDemo';
import {Story, DURATION, FPS} from './Story';
import {Story2, DURATION2, FPS2} from './Story2';

export const Root = () => (
  <>
  <Composition id="Story2" component={Story2} durationInFrames={Math.ceil(DURATION2 * FPS2)} fps={FPS2} width={1080} height={1920} />
  <Composition id="Story" component={Story} durationInFrames={Math.ceil(DURATION * FPS)} fps={FPS} width={1080} height={1920} />
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
