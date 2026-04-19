import { GoogleGenAI } from '@google/genai';

// Initialize Vertex with your Cloud project and location
const ai = new GoogleGenAI({
  vertexai: true,
  project: 'garment-design-ai-2025',
  location: 'global'
});
const model = 'gemini-2.5-flash-image';


// Set up generation config
const generationConfig = {
  maxOutputTokens: 32768,
  temperature: 1,
  topP: 0.95,
  responseModalities: ["TEXT", "IMAGE"],
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'OFF',
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'OFF',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'OFF',
    },
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'OFF',
    },
    {
      category: 'HARM_CATEGORY_IMAGE_HATE',
      threshold: 'OFF',
    },
    {
      category: 'HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT',
      threshold: 'OFF',
    },
    {
      category: 'HARM_CATEGORY_IMAGE_HARASSMENT',
      threshold: 'OFF',
    },
    {
      category: 'HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT',
      threshold: 'OFF',
    }
  ],
};

const image1 = {
  fileData: {
    mimeType: 'image/jpeg',
    fileUri: `gs://cloud-samples-data/generative-ai/image/croissant.jpeg`
  }
};
const text1 = {text: `Add some chocolate drizzle to the croissants. Include text across the top of the image that says "Made Fresh Daily".`};

async function generateContent() {
  const req = {
    model: model,
    contents: [
      {role: 'user', parts: [image1, text1]}
    ],
    config: generationConfig,
  };

  const streamingResp = await ai.models.generateContentStream(req);

  for await (const chunk of streamingResp) {
    if (chunk.text) {
      process.stdout.write(chunk.text);
    } else {
      process.stdout.write(JSON.stringify(chunk) + '\n');
    }
  }
}

generateContent();