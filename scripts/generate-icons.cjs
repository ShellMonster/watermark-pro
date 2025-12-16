const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
const outputDir = path.join(__dirname, '../public/icons');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// SVG 图标内容
const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366F1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#grad)"/>
  <text x="256" y="340" font-family="Arial, sans-serif" font-size="300" font-weight="bold" fill="white" text-anchor="middle">W</text>
</svg>
`;

async function generateIcons() {
  console.log('开始生成 PWA 图标...');

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

    await sharp(Buffer.from(svgContent))
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`✓ 生成 icon-${size}x${size}.png`);
  }

  console.log('\\n所有图标生成完成！');
}

generateIcons().catch(console.error);
