// Entry point: pull in every animation module, then mount whatever the page
// actually asked for. Modules register themselves on import, so mounting must
// happen last.

import { mountAll, mountVideos } from './anim-core.js';
import './anim-dc.js';
import './anim-measure.js';
import './anim-parts.js';
import './anim-load.js';
import './anim-analogue.js';
import './anim-data.js';
import './anim-mcu.js';
import './anim-sense.js';
import './anim-safety.js';

mountAll();
mountVideos();

// A link straight to a figure lands before the canvas has any height, so the
// reader ends up a screen above the thing they asked for. app.js has already
// opened the panel it lives in; this only corrects for the height it gains.
if (location.hash.startsWith('#fig-')) {
  const t = document.getElementById(location.hash.slice(1));
  if (t) requestAnimationFrame(() => t.scrollIntoView({ block: 'center' }));
}
