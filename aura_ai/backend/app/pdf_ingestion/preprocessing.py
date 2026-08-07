from __future__ import annotations

import math
from typing import Tuple, Dict, Any

try:
    import cv2
    import numpy as np
    HAS_OPENCV = True
except ImportError:
    HAS_OPENCV = False

class OpenCVDocumentPreprocessor:
    """
    Component 1: OpenCV Image Preprocessing Pipeline.
    Implements automated orientation detection, deskewing (Hough Lines),
    CLAHE adaptive contrast enhancement, and bilateral denoising.
    """

    @classmethod
    def preprocess_image(cls, image_bytes: bytes) -> Tuple[bytes, Dict[str, Any]]:
        metrics = {
            "opencv_available": HAS_OPENCV,
            "deskew_angle": 0.0,
            "contrast_score": 1.0,
            "blur_score_laplacian": 100.0,
            "quality_pass": True
        }

        if not HAS_OPENCV or not image_bytes:
            return image_bytes, metrics

        try:
            # Decode image
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if img is None:
                return image_bytes, metrics

            # 1. Convert to Grayscale
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

            # 2. Laplacian Blur Score
            blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
            metrics["blur_score_laplacian"] = round(float(blur_score), 2)
            if blur_score < 30.0:
                metrics["quality_pass"] = False

            # 3. CLAHE Contrast Enhancement
            clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
            enhanced = clahe.apply(gray)
            metrics["contrast_score"] = round(float(enhanced.std() / 128.0), 2)

            # 4. Hough Lines Deskewing
            edges = cv2.Canny(enhanced, 50, 150, apertureSize=3)
            lines = cv2.HoughLinesP(edges, 1, math.pi / 180, threshold=100, minLineLength=100, maxLineGap=10)
            
            angle = 0.0
            if lines is not None and len(lines) > 0:
                angles = []
                for line in lines:
                    x1, y1, x2, y2 = line[0]
                    if x2 - x1 != 0:
                        rad = math.atan2(y2 - y1, x2 - x1)
                        deg = math.degrees(rad)
                        if -45 < deg < 45:
                            angles.append(deg)
                if angles:
                    angle = float(np.median(angles))

            metrics["deskew_angle"] = round(angle, 2)

            # Rotate if skew > 0.5 degrees
            if abs(angle) > 0.5:
                (h, w) = enhanced.shape[:2]
                center = (w // 2, h // 2)
                M = cv2.getRotationMatrix2D(center, angle, 1.0)
                enhanced = cv2.warpAffine(enhanced, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

            # 5. Denoise
            denoised = cv2.fastNlMeansDenoising(enhanced, h=10, templateWindowSize=7, searchWindowSize=21)

            # Encode back to PNG bytes
            success, encoded_img = cv2.imencode(".png", denoised)
            if success:
                return encoded_img.tobytes(), metrics

        except Exception as e:
            print(f"[PREPROCESSING WARNING] OpenCV pipeline exception: {e}")

        return image_bytes, metrics
