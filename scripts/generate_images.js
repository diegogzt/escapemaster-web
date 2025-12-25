const fs = require("fs");
const path = require("path");
const https = require("https");

const API_KEY = process.env.OPENAI_API_KEY;

async function generateImage(prompt, filename) {
  console.log(`Generating ${filename}...`);

  try {
    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
          response_format: "b64_json",
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const imageBuffer = Buffer.from(data.data[0].b64_json, "base64");
    const outputPath = path.join(__dirname, "../public", filename);

    fs.writeFileSync(outputPath, imageBuffer);
    console.log(`Successfully saved ${filename}`);
  } catch (error) {
    console.error(`Error generating ${filename}:`, error.message);
  }
}

async function main() {
  await generateImage(
    "A high-end, luxury UI mockup of an escape room management software on a laptop screen, set against a blurred tropical Bali villa background. The UI features a forest green and sand color palette, elegant typography, and clean charts. Photorealistic, 4k, cinematic lighting.",
    "hero-image.png"
  );

  await generateImage(
    "A mysterious and luxurious ancient temple entrance in a Bali jungle, hidden by vines and mist. Cinematic lighting, golden hour rays penetrating the canopy, high detail, photorealistic, adventure atmosphere.",
    "experience-bg.png"
  );
}

main();
