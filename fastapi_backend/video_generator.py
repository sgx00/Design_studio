"""
Fashion Video Generator using Google Veo 3.1
Generates image-to-video fashion model shoots via the Gemini API.
"""

import os
import time
import logging
from pathlib import Path
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)


class FashionVideoGenerator:
    def __init__(self):
        self.client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
        self.model = "veo-3.1-generate-preview"

    def build_prompt(self, options: dict = {}) -> str:
        style = options.get("style", "elegant")
        occasion = options.get("occasion", "runway")
        return (
            f"A professional fashion model wearing this exact garment, filmed as a high-end fashion editorial. "
            f"The model walks confidently forward on a clean, bright {occasion} set with dramatic studio lighting. "
            f"The fabric moves and drapes naturally with the model's motion. "
            f"{style.capitalize()} fashion photography style, cinematic quality, "
            f"soft directional lighting, minimal white background. "
            f"The garment is the centrepiece — fully visible and beautifully lit throughout the shot."
        )

    def generate(self, image_path: str, output_dir: str, options: dict = {}) -> str:
        """
        Generate a fashion model shoot video from a garment image.
        Returns the path to the saved .mp4 file.
        """
        prompt = options.get("prompt") or self.build_prompt(options)
        aspect_ratio = options.get("aspect_ratio", "9:16")
        duration_seconds = options.get("duration_seconds", 8)

        image_bytes = Path(image_path).read_bytes()
        mime_type = "image/png" if image_path.lower().endswith(".png") else "image/jpeg"

        logger.info(f"Starting Veo 3.1 generation | model={self.model} | aspect={aspect_ratio} | duration={duration_seconds}s")

        first_image = types.Image(image_bytes=image_bytes, mime_type=mime_type)

        operation = self.client.models.generate_videos(
            model=self.model,
            prompt=prompt,
            image=first_image,
            config=types.GenerateVideosConfig(
                number_of_videos=1,
                duration_seconds=duration_seconds,
                aspect_ratio=aspect_ratio,
            ),
        )

        logger.info("Polling Veo operation...")
        while not operation.done:
            logger.info("Waiting for video generation to complete...")
            time.sleep(10)
            operation = self.client.operations.get(operation)

        video = operation.response.generated_videos[0]

        # Download and save
        self.client.files.download(file=video.video)

        import uuid as _uuid
        output_path = str(Path(output_dir) / f"video-{_uuid.uuid4()}.mp4")
        video.video.save(output_path)

        logger.info(f"Fashion video saved: {output_path}")
        return output_path
