import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';
const times = process.argv.slice(2).map(Number);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const opts = {serveUrl, browserExecutable: '/opt/pw-browsers/chromium', chromeMode: 'chrome-for-testing', chromiumOptions: {gl: 'swangle'}};
const comp = await selectComposition({...opts, id: 'Story3'});
for (const t of times) {
  await renderStill({...opts, composition: comp, frame: Math.round(t * 30), output: `out/s3/${t}.png`, scale: 0.4});
}
console.log('done');
