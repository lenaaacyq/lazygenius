from io import BytesIO
from PIL import Image
import pytesseract
from pytesseract import TesseractNotFoundError


def extract_text_from_image_bytes(image_bytes: bytes) -> str:
    try:
        image = Image.open(BytesIO(image_bytes))
    except Exception:
        return ""
    try:
        text = pytesseract.image_to_string(image)
    except TesseractNotFoundError as e:
        raise RuntimeError("tesseract_not_installed") from e
    return (text or "").strip()
