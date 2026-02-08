import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Debug marker: if you still see an empty <app-root>, but this marker appears,
// then JavaScript is running and the issue is inside Angular bootstrap.
const root = document.querySelector('app-root');
if (root) {
  root.innerHTML = '<div style="padding:12px;font-family:system-ui">JS OK — Angular bootstrap en cours…</div>';
}

bootstrapApplication(App, appConfig).catch((err) => {
  // If bootstrap fails, we show the error visibly on the page.
  console.error(err);
  if (root) {
    root.innerHTML = `<pre style="white-space:pre-wrap;padding:12px;color:#b91c1c">Bootstrap error:\n${String(err)}</pre>`;
  }
});
