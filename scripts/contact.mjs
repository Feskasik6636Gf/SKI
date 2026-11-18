import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'fs';
const id = process.argv[2] || 'Bracelet'; const frames = process.argv[3].split(',').map(Number); const dir = process.argv[4] || '/tmp/claude-0/work/stills';
fs.mkdirSync(dir, {recursive: true});
const serve = await bundle({entryPoint: 'src/index.ts'});
const comp = await selectComposition({serveUrl: serve, id, chromiumOptions: {ignoreCertificateErrors: true}});
for (const f of frames) await renderStill({composition: comp, serveUrl: serve, frame: f, output: `${dir}/f${String(f).padStart(5, '0')}.jpg`, imageFormat: 'jpeg', jpegQuality: 70, scale: 0.4, chromiumOptions: {ignoreCertificateErrors: true}});
console.log('ok', comp.durationInFrames);
