/* Assembla English Quest in un unico file HTML autonomo. */
const fs = require('fs');
const path = require('path');

const dir = __dirname;
// due copie identiche dalla stessa sorgente, così non possono divergere:
// index.html è quella pubblicata online, english-quest.html quella da spedire
const outs = process.argv[2]
  ? [process.argv[2]]
  : [path.join(dir, '..', 'index.html'), path.join(dir, '..', '..', 'english-quest.html')];
const R = f => fs.readFileSync(path.join(dir, f), 'utf8');

const font = R('font.css');
let head = R('p1-head.html');
if (!head.includes('/*!FONT_INJECT*/')) throw new Error('marcatore del font non trovato');
head = head.replace('/*!FONT_INJECT*/', () => font);

const html =
  head + '\n' +
  R('p2-body.html') + '\n' +
  '<script>\n' + R('p3-data.js') + '\n</' + 'script>\n' +
  '<script>\n' + R('p4-app.js') + '\n</' + 'script>\n' +
  '</body>\n</html>\n';

outs.forEach(function(out){
  fs.writeFileSync(out, html, 'utf8');
  console.log('scritto', path.resolve(out), (html.length / 1024).toFixed(0) + ' KB');
});
