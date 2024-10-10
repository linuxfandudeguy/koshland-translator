// imports
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { site } = require('./astro.config.mjs'); // Import the site URL from Astro config

// Specify the directory to scan for HTML files (output directory after build)
const directoryToScan = path.resolve('./dist'); // Adjust if necessary

// Function to get all HTML files recursively
function getAllHtmlFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllHtmlFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith('.html')) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

// Function to generate sitemap XML
function generateSitemap(urls) {
  const urlSet = urls.map(url => {
    const relativePath = path.relative(directoryToScan, url);
    const loc = new URL(relativePath, site).toString();
    return `
      <url>
        <loc>${loc}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
      </url>
    `;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap-image/1.1">
    ${urlSet}
  </urlset>`;
}

// Get all HTML files
const allHtmlFiles = getAllHtmlFiles(directoryToScan);

// Generate the sitemap XML
const sitemapXml = generateSitemap(allHtmlFiles);

// Write the sitemap to the dist directory
const sitemapPath = path.join(directoryToScan, 'sitemap.xml');
fs.writeFileSync(sitemapPath, sitemapXml.trim());
console.log(`Sitemap generated at: ${sitemapPath}`);
