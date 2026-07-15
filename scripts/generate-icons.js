const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const svgPath = path.join(root, 'resources/icons/icon.svg');
const svg = fs.readFileSync(svgPath);

const outDirs = [
  path.join(root, 'build'),
  path.join(root, 'resources/icons'),
  path.join(root, 'src/app'),
];

for (const dir of outDirs) {
  fs.mkdirSync(dir, { recursive: true });
}

const master = new Resvg(svg, { fitTo: { mode: 'width', value: 1024 } }).render().asPng();
fs.writeFileSync(path.join(root, 'build/icon.png'), master);
fs.writeFileSync(path.join(root, 'resources/icons/icon.png'), master);
fs.writeFileSync(path.join(root, 'src/app/favicon.png'), master);
fs.copyFileSync(svgPath, path.join(root, 'src/app/favicon.svg'));

for (const size of [16, 32, 64, 128, 256, 512]) {
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();
  fs.writeFileSync(path.join(root, `resources/icons/icon-${size}.png`), png);
}

console.log('Generated GoalOS icons from resources/icons/icon.svg');
