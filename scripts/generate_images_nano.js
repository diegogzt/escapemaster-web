const fs = require("fs");
const path = require("path");

const API_KEY = "AIzaSyCjAXS924l2JUOCyIMthpPlU5FOf7oft_s";
const MODEL = "imagen-3.0-generate-001";

async function generateImage(prompt, filename) {
  console.log(`Generating ${filename} with ${MODEL}...`);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

  const body = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: "2K",
      },
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    // Navigate the response structure to find the image
    // Structure: candidates[0].content.parts[].inlineData.data
    const candidate = data.candidates?.[0];
    if (!candidate) {
      throw new Error("No candidates returned");
    }

    const imagePart = candidate.content?.parts?.find((p) => p.inlineData);

    if (!imagePart) {
      console.log("Full response:", JSON.stringify(data, null, 2));
      throw new Error("No image part found in response");
    }

    const imageBuffer = Buffer.from(imagePart.inlineData.data, "base64");
    const outputPath = path.join(__dirname, "../public", filename);

    fs.writeFileSync(outputPath, imageBuffer);
    console.log(`Successfully saved ${filename}`);
  } catch (error) {
    console.error(`Error generating ${filename}:`, error.message);
  }
}

async function main() {
  // Hero Image
  await generateImage(
    "A high-end, luxury UI mockup of an escape room management software on a laptop screen, set against a blurred tropical Bali villa background. The UI features a forest green and sand color palette, elegant typography, and clean charts. Photorealistic, 4k, cinematic lighting.",
    "hero-image.png"
  );

  // Experience Background
  await generateImage(
    "A mysterious and luxurious ancient temple entrance in a Bali jungle, hidden by vines and mist. Cinematic lighting, golden hour rays penetrating the canopy, high detail, photorealistic, adventure atmosphere.",
    "experience-bg.png"
  );
}

main();
