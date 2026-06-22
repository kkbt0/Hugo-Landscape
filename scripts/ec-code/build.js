await Bun.build({
  entrypoints: ['./src/index.js'],
  outdir: './dist',
  target: 'bun',
  naming: 'ec-code.[ext]',
  minify: true,
  bytecode: true,
});