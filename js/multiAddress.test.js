const test = require("node:test");
const assert = require("node:assert");
const { toEvmAddress, fromEvmAddress } = require("./multiAddress");

const rawAddress = "70586beeb7b7aa2e7966df9c8493c6cbfd75c625";
const checksummedAddress = "70586BeEB7b7Aa2e7966DF9c8493C6CbFd75C625";
const hexPrefixChecksummedAddress = "0x70586BeEB7b7Aa2e7966DF9c8493C6CbFd75C625";

// test toEvmAddress
test("normalizes already 0x-prefixed hex", () => {
  const input = "0x"+rawAddress;
  console.log("converted to", toEvmAddress(input));
  assert.strictEqual(
    toEvmAddress(input),
    hexPrefixChecksummedAddress
  );
});

test("normalizes bare hex", () => {
  const input = rawAddress;
  assert.strictEqual(
    toEvmAddress(input),
    hexPrefixChecksummedAddress
  );
});

test("normalizes XKO-prefixed hex", () => {
  const input = "XKO"+rawAddress;
  assert.strictEqual(
    toEvmAddress(input),
    hexPrefixChecksummedAddress
  );
});

test("rejects wrong length", () => {
  assert.throws(
    () => toEvmAddress("0x1234"),
    /Invalid address length/
  );
});

test("rejects invalid chars", () => {
  assert.throws(
    () => toEvmAddress("0xzbcdefabcdefabcdefabcdefabcdefabcdefabcd"),
    /Invalid hex characters/
  );
});

test("rejects non-string input", () => {
  assert.throws(() => toEvmAddress(123), /Address must be a string/);
});

// test fromEvmAddress
test("converts 0x prefixed EVM address back to XKO", () => {
  assert.strictEqual(
    fromEvmAddress("0x"+rawAddress),
    "XKO"+checksummedAddress
  );
});

test("converts EVM address back to XKO", () => {
  assert.strictEqual(
    fromEvmAddress(rawAddress),
    "XKO"+checksummedAddress
  );
});

test("fromEvmAddress rejects non-string input", () => {
  assert.throws(() => fromEvmAddress(123), /Address must be a string/);
});

test("fromEvmAddress rejects invalid hex", () => {
  assert.throws(
    () => fromEvmAddress("0xZZZDEFABCDEFABCDEFABCDEFABCDEFABCDEFABCD"),
    /Invalid hex characters/
  );
});