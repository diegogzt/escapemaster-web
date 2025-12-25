
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('Navigating to Rogue Studio...');
  await page.goto('https://rogue.studio/');
  
  // Get background color and font family of body
  const bodyStyle = await page.evaluate(() => {
    const style = window.getComputedStyle(document.body);
    return {
      backgroundColor: style.backgroundColor,
      fontFamily: style.fontFamily,
      color: style.color
    };
  });
  
  console.log('Rogue Studio Styles:', bodyStyle);

  // Check for h1 styles
  const h1Style = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    if (!h1) return null;
    const style = window.getComputedStyle(h1);
    return {
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing
    };
  });
  
  console.log('Rogue Studio H1 Styles:', h1Style);

  await browser.close();
})();
