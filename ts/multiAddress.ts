import sha3 from "js-sha3";
const { keccak256 } = sha3;

const OKX_PREFIX = "XKO";


export function toChecksumAddress(address: string): string {
  if (typeof address !== "string") {
    throw new Error("Address must be a string");
  }
  let addr = address.trim().toLowerCase();

  if (addr.startsWith("0x")) {
    addr = addr.slice(2);
  }

  const hash = keccak256(addr);
  let checksum = "0x";

  for (let i = 0; i < 40; i++) {
    if (parseInt(hash[i], 16) > 7) {
      checksum += addr[i].toUpperCase();
    } else {
      checksum += addr[i];
    }
  }

  return checksum;
}

export function toEvmAddress(input: string): string {
  if (typeof input !== "string") {
    throw new Error("Address must be a string");
  }

  let s = input.trim().toLowerCase();
  const prefixLower = OKX_PREFIX.toLowerCase();

  if (s.startsWith("0x")) {
    s = s.slice(2);
  } else if (s.startsWith(prefixLower)) {
    s = s.slice(3);
  }

  if (s.length !== 40) {
    throw new Error(`Invalid address length: expected 40 hex chars, got ${s.length}`);
  }

  if (!/^[0-9a-f]{40}$/.test(s)) {
    throw new Error("Invalid hex characters in address");
  }

  return toChecksumAddress(s);
}

export function fromEvmAddress(input: string): string {
  if (typeof input !== "string") {
    throw new Error("Address must be a string");
  }

  let s = input.trim().toLowerCase();
  if (s.startsWith("0x")) {
    s = s.slice(2);
  }

  if (s.length !== 40) {
    throw new Error(`Invalid address length: expected 40 hex chars, got ${s.length}`);
  }

  if (!/^[0-9a-f]{40}$/.test(s)) {
    throw new Error("Invalid hex characters in address");
  }

  const checksummed = toChecksumAddress(s);
  const without0x = checksummed.startsWith("0x") ? checksummed.slice(2) : checksummed;
  return OKX_PREFIX + without0x;
}