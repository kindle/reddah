import { p as patchBrowser, g as globals, b as bootstrapLazy } from './core-71e595ab.js';

patchBrowser().then(options => {
  globals();
  return bootstrapLazy([["reddah-mini-app",[[1,"reddah-mini-app",{"first":[1],"middle":[1],"last":[1]}]]]], options);
});
