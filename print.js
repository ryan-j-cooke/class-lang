const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function slowScroll(page, scrollDelay = 200, scrollStep = 100) {
  await page.evaluate(async (scrollDelay, scrollStep) => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = scrollStep;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, scrollDelay);
    });
  }, scrollDelay, scrollStep);
}

async function downloadAsPDF(url, outputPath = 'output.pdf') {
  if (!url || typeof url !== 'string') {
    console.error('❌ A valid URL must be provided.');
    return;
  }

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  await page.setViewport({ width: 1366, height: 1366 });

  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
  page.on('requestfailed', (request) =>
    console.log(`❌ Request failed: ${request.url()} - ${request.failure()?.errorText}`)
  );

  try {
    console.log(`🌐 Navigating to ${url}...`);
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 60000,
    });

    await page.emulateMediaType('screen');

    await page.addStyleTag({
      content: `
        * {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }
        html, body {
          margin: 0;
          padding: 0;
        }
      `,
    });

    // Scroll slowly to bottom to trigger lazy loading
    await slowScroll(page);

    // Wait a bit after scrolling so content loads
    await page.waitForTimeout(1500);

    const bodyHeight = await page.evaluate(() => {
      return Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight
      );
    });

    console.log(`📄 Generating PDF with height: ${bodyHeight}px`);

    await page.pdf({
      path: outputPath,
      printBackground: true,
      width: '1366px',
      height: `${bodyHeight}px`, // tall height for full page
      pageRanges: '1',
    });

    console.log(`✅ PDF saved to ${path.resolve(outputPath)}`);
  } catch (err) {
    console.error('❌ Error downloading PDF:', err.message);
  } finally {
    await browser.close();
  }
}

// Example usage
const urlToDownload = process.argv[2] || 'http://localhost:2000/resume.html';
const fileName = process.argv[3] || path.join(__dirname, 'output', 'resume.pdf');

downloadAsPDF(urlToDownload, fileName);
