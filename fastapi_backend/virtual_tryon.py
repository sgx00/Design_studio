"""
Virtual Try-On using Google Gemini image generation.
Composites a garment onto a person image using multimodal image editing.
"""

import os
import uuid
import logging
from pathlib import Path
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

TRYON_PROMPT_TEMPLATE = (
    "Virtual fashion try-on task: Generate a single photorealistic image of the person from image 1 "
    "wearing the exact garment shown in image 2.\n\n"
    "Strict requirements:\n"
    "- Preserve the person's face, hair colour, skin tone, body shape, and pose exactly as shown in image 1\n"
    "- The garment must match the original design, colour, texture, pattern, and all details from image 2\n"
    "- The garment should drape and fit naturally on the person's body with realistic shadows and folds\n"
    "- {background_instruction}\n"
    "- {style_instruction}\n"
    "- Professional fashion photography quality — sharp focus, natural lighting, no artifacts\n"
    "Output only the composite try-on image, nothing else."
)

BACKGROUND_INSTRUCTIONS = {
    "studio": "Use a clean, neutral studio background with soft diffused lighting",
    "original": "Keep the original background from the person image",
    "runway": "Place the person on a high-fashion runway with bright editorial lighting",
    "street": "Place the person on a stylish urban street setting",
    "outdoor": "Place the person in a bright outdoor natural setting",
}

STYLE_INSTRUCTIONS = {
    "": "Natural, realistic look",
    "editorial": "High-fashion editorial photography style with dramatic lighting",
    "lookbook": "Clean lookbook style with even lighting and minimal shadows",
    "campaign": "Fashion campaign style, aspirational and polished",
    "street": "Candid street-style photography aesthetic",
}


class VirtualTryOn:
    def __init__(self):
        self.client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
        self.model = "gemini-3.1-flash-image-preview"

    def build_prompt(self, style: str = "", background: str = "studio") -> str:
        bg_instr = BACKGROUND_INSTRUCTIONS.get(background, BACKGROUND_INSTRUCTIONS["studio"])
        st_instr = STYLE_INSTRUCTIONS.get(style, STYLE_INSTRUCTIONS[""])
        return TRYON_PROMPT_TEMPLATE.format(
            background_instruction=bg_instr,
            style_instruction=st_instr,
        )

    def try_on(
        self,
        person_image_bytes: bytes,
        garment_image_bytes: bytes,
        person_mime: str,
        garment_mime: str,
        output_dir: str,
        style: str = "",
        background: str = "studio",
    ) -> str:
        prompt = self.build_prompt(style=style, background=background)

        logger.info(
            f"Starting virtual try-on | model={self.model} | "
            f"style={style or 'default'} | background={background}"
        )

        response = self.client.models.generate_content(
            model=self.model,
            contents=[
                types.Part.from_bytes(data=person_image_bytes, mime_type=person_mime),
                types.Part.from_bytes(data=garment_image_bytes, mime_type=garment_mime),
                types.Part.from_text(text=prompt),
            ],
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
            ),
        )

        # Extract the generated image from the response
        for candidate in response.candidates:
            for part in candidate.content.parts:
                if part.inline_data is not None:
                    image_data = part.inline_data.data
                    ext = "png" if "png" in part.inline_data.mime_type else "jpg"
                    output_path = str(Path(output_dir) / f"tryon-{uuid.uuid4()}.{ext}")
                    with open(output_path, "wb") as f:
                        f.write(image_data)
                    logger.info(f"Try-on image saved: {output_path}")
                    return output_path

        raise ValueError("Gemini returned no image in the try-on response")
