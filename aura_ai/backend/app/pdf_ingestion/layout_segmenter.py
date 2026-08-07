from __future__ import annotations

from typing import Dict, Any, Tuple

class LayoutRegionSegmenter:
    """
    Component 2: Layout Bounding Box Segmenter.
    Splits document text or image region into three distinct bounding boxes:
    1. Header Region (Top 35%): Printed Hospital, Doctor, Qualifications, Reg No.
    2. Clinical Body Region (Middle 55%): Handwritten Rx, Diagnosis, Medicines, Advice.
    3. Footer Region (Bottom 10%): Signature, Follow-up Date, Address.
    """

    @classmethod
    def segment_text_blocks(cls, raw_text: str) -> Dict[str, str]:
        lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
        total_lines = len(lines)

        if total_lines == 0:
            return {"header": "", "body": "", "footer": ""}

        if total_lines < 4:
            return {"header": raw_text, "body": raw_text, "footer": ""}

        header_end = max(1, int(total_lines * 0.35))
        footer_start = max(header_end + 1, int(total_lines * 0.85))

        header_lines = lines[:header_end]
        body_lines = lines[header_end:footer_start]
        footer_lines = lines[footer_start:]

        return {
            "header": "\n".join(header_lines),
            "body": "\n".join(body_lines),
            "footer": "\n".join(footer_lines)
        }
