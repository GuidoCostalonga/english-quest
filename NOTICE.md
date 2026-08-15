# Note sulle licenze

**Il codice** di English Quest — HTML, CSS, JavaScript e contenuti didattici,
cioè tutto quello che sta in `src/` e il risultato in `index.html` — è di
**@ginopizza** ed è rilasciato sotto licenza **MIT**, il cui testo è in
[`LICENSE`](LICENSE).

**Il carattere** incorporato in `index.html` è **OpenDyslexic**, di Abbie Gonzalez,
e mantiene la propria licenza: **SIL Open Font License 1.1**, testo completo in
[`OFL-OpenDyslexic.txt`](OFL-OpenDyslexic.txt).

Le due cose viaggiano insieme: `index.html` contiene il carattere in base64, quindi
chi ridistribuisce quel file ridistribuisce anche OpenDyslexic e deve portarsi
dietro entrambe le licenze. In pratica basta tenere nella copia i file `LICENSE`
e `OFL-OpenDyslexic.txt`.

Se ti serve solo il codice, senza vincoli sul carattere, svuota `src/font.css`
e ricompila con `node src/build.js`: l'app userà i caratteri già presenti nel
dispositivo e resterà solo sotto MIT.
