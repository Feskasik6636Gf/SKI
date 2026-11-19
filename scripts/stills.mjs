import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';
const times = process.argv.slice(2).map(Number);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const opts = {serveUrl, browserExecutable: '/opt/pw-browsers/chromium', chromeMode: 'chrome-for-testing', chromiumOptions: {gl: 'swangle'}};
const comp = await selectComposition({...opts, id: process.env.COMP || 'Story'});
for (const t of times) {
  await renderStill({...opts, composition: comp, frame: Math.round(t * 30), output: `out/shots/${process.env.COMP || 'Story'}_${t}.png`, scale: 0.5});
  console.log('ok', t);
}
