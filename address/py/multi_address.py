from __future__ import annotations

import re
from eth_utils import keccak, to_checksum_address  # pip install eth_utils

OKX_PREFIX = "XKO"
HEX_BODY_RE = re.compile(r"^[0-9a-f]{40}$")


def _normalize_body(candidate: str) -> str:
    if not isinstance(candidate, str):
        raise TypeError("Address must be a string")

    s = candidate.strip().lower()

    if s.startswith("0x"):
        s = s[2:]
    elif s.startswith(OKX_PREFIX.lower()):
        s = s[3:]

    if len(s) != 40:
        raise ValueError(f"Invalid address length: expected 40 hex chars, got {len(s)}")

    if not HEX_BODY_RE.match(s):
        raise ValueError("Invalid hex characters in address")

    return s


def to_evm_address(raw: str) -> str:
    body = _normalize_body(raw)
    return to_checksum_address(f"0x{body}")


def from_evm_address(raw: str) -> str:
    if not isinstance(raw, str):
        raise TypeError("Address must be a string")

    s = raw.strip().lower()
    if s.startswith("0x"):
        s = s[2:]

    if len(s) != 40:
        raise ValueError(f"Invalid address length: expected 40 hex chars, got {len(s)}")

    if not HEX_BODY_RE.match(s):
        raise ValueError("Invalid hex characters in address")

    checksum = to_checksum_address(f"0x{s}")[2:]  # strip 0x prefix
    return OKX_PREFIX + checksum