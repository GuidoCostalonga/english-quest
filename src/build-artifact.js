/* Variante per la pubblicazione come pagina web: stesso programma,
   senza i tag <html>/<head>/<body> che il servizio aggiunge da sé. */
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const out = process.argv[2] || path.join(dir, 'english-quest-web.html');
const R = f => fs.readFileSync(path.join(dir, f), 'utf8');

const head = R('p1-head.html').replace('/*!FONT_INJECT*/', () => R('font.css'));
const title = head.match(/<title>([\s\S]*?)<\/title>/)[1];
const style = head.match(/<style>[\s\S]*?<\/style>/)[0];

const html =
  '<title>' + title + '</title>\n' +
  style + '\n' +
  R('p2-body.html') + '\n' +
  '<script>\n' + R('p3-data.js') + '\n</' + 'script>\n' +
  '<script>\n' + R('p4-app.js') + '\n</' + 'script>\n';

fs.writeFileSync(out, html, 'utf8');
console.log('scritto', out, (html.length / 1024).toFixed(0) + ' KB');
