const { createHash } = require("crypto");
const { keccak256 } = require("js-sha3");

function toChecksumAddress(hexBody) {
  const hash = keccak256(hexBody);
  let result = "0x";
  for (let i = 0; i < hexBody.length; i++) {
    result += parseInt(hash[i], 16) >= 8
      ? hexBody[i].toUpperCase()
      : hexBody[i];
  }
  return result;
}

const OKX_PREFIX = "XKO";

/**
 * Normalize an address-like string into a 0x-prefixed EVM address.
 *
 * Accepts:
 *  - "0x" prefixed hex string (40 hex chars after prefix)
 *  - plain hex string (40 chars)
 *  - "XKO" prefixed hex string (40 chars after prefix)
 *
 * Returns:
 *  - 0x-prefixed lowercase 40-hex-character address
 */
function toEvmAddress(input) {
  if (typeof input !== "string") {
    throw new Error("Address must be a string");
  }

  let s = input.trim();
  s = s.toLowerCase();

  const prefixLower = OKX_PREFIX.toLowerCase();
  if (s.startsWith("0x")) {
    s = s.slice(2);
  } else if (s.startsWith(prefixLower)) {
    s = s.slice(3);
  }

  if (s.length !== 40) {
    throw new Error(`Invalid address length: expected 40 hex chars, got ${s.length}`);
  }

  if (!/^[0-9a-fA-F]{40}$/.test(s)) {
    throw new Error("Invalid hex characters in address");
  }
  return toChecksumAddress(s);
}

/**
 * Convert an EVM address (0x-prefixed or not) into an XKO-prefixed address.
 *
 * Accepts:
 *  - "0x" prefixed hex string (40 hex chars)
 *  - plain hex string (40 chars)
 *
 * Returns:
 *  - "XKO" + 40 hex chars (lowercase)
 */
function fromEvmAddress(input) {
  if (typeof input !== "string") {
    throw new Error("Address must be a string");
  }

  let s = input.trim();
  s = s.toLowerCase();
  if (s.startsWith("0x")) {
    s = s.slice(2);
  }

  if (s.length !== 40) {
    throw new Error(`Invalid address length: expected 40 hex chars, got ${s.length}`);
  }

  if (!/^[0-9a-fA-F]{40}$/.test(s)) {
    throw new Error("Invalid hex characters in address");
  }
  const checksummed = toChecksumAddress(s);
  const without0x = checksummed.startsWith("0x") ? checksummed.slice(2) : checksummed;
  return OKX_PREFIX + without0x;
}


module.exports = { toEvmAddress, fromEvmAddress };