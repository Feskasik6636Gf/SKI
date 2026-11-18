import {Composition} from 'remotion';
import {DoodleShort} from './DoodleShort';
import {StyleDemo} from './StyleDemo';
import {Story, DURATION, FPS} from './Story';
import {Bracelet, DURATION as BD, FPS as BF} from './Bracelet';

export const Root = () => (
  <>
  <Composition id="Bracelet" component={Bracelet} durationInFrames={Math.ceil(BD * BF)} fps={BF} width={1080} height={1920} />
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
