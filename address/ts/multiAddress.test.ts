import { describe, it } from "mocha";
import { strict as assert } from "node:assert";
import { toEvmAddress, fromEvmAddress } from "./multiAddress.ts";

const rawAddress = "70586beeb7b7aa2e7966df9c8493c6cbfd75c625";
const checksummedAddress = "70586BeEB7b7Aa2e7966DF9c8493C6CbFd75C625";
const hexPrefixedChecksum = `0x${checksummedAddress}`;

describe("toEvmAddress", () => {
  it("normalizes already 0x-prefixed hex", () => {
    assert.equal(toEvmAddress(`0x${rawAddress}`), hexPrefixedChecksum);
  });

  it("normalizes bare hex", () => {
    assert.equal(toEvmAddress(rawAddress), hexPrefixedChecksum);
  });

  it("normalizes XKO-prefixed hex", () => {
    assert.equal(toEvmAddress(`XKO${rawAddress}`), hexPrefixedChecksum);
  });

  it("rejects wrong length", () => {
    assert.throws(() => toEvmAddress("0x1234"), /Invalid address length/);
  });

  it("rejects invalid chars", () => {
    assert.throws(
      () => toEvmAddress("0xzbcdefabcdefabcdefabcdefabcdefabcdefabcd"),
      /Invalid hex characters/
    );
  });

  it("rejects non-string input", () => {
    // @ts-expect-error deliberate misuse
    assert.throws(() => toEvmAddress(123), /Address must be a string/);
  });
});

describe("fromEvmAddress", () => {
  it("converts 0x-prefixed EVM address back to XKO", () => {
    assert.equal(fromEvmAddress(`0x${rawAddress}`), `XKO${checksummedAddress}`);
  });

  it("converts bare EVM address back to XKO", () => {
    assert.equal(fromEvmAddress(rawAddress), `XKO${checksummedAddress}`);
  });

  it("rejects non-string input", () => {
    // @ts-expect-error deliberate misuse
    assert.throws(() => fromEvmAddress(123), /Address must be a string/);
  });

  it("rejects invalid hex", () => {
    assert.throws(
      () => fromEvmAddress("0xZZZDEFABCDEFABCDEFABCDEFABCDEFABCDEFABCD"),
      /Invalid hex characters/
    );
  });
});