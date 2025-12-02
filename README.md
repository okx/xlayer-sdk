# Description
This repo contains multi language sdk for interacting with xlayer blockchain. Currently, we provide custom support for below functionalities
- `XKO` prefixed address

# `XKO` prefixed address

Utilities for normalizing account identifiers between OKX’s `XKO` format and standard EVM addresses. The implementation exists in multiple languages (`js/`, `ts/`, `py/`, `go/`, `rust/`, `java/`)

## `toEvmAddress`

Converts an address-like string into an EIP55 checksummed `0x` prefixed EVM address.

- **Accepted input forms**
  - none-prefixed EVM address: 40 hex chars.
  - "0x"-prefixed EVM address: `0x` + 40 hex chars.
  - "XKO"-prefixed EVM address: `XKO` + 40 hex chars.
- **Output**
  - A `0x`-prefixed, 40-character, EIP55 checksummed address.
- **Errors**
  - `Address must be a string` if the input isn’t a string.
  - `Invalid address length` if (after trimming/prefix removal) the length ≠ 40.
  - `Invalid hex characters in address` if non-hex characters are present.


## `fromEvmAddress`

Converts a `0x`-prefixed EVM address back into an `XKO` prefixed address-like string that keeps the checksum casing but omits the `0x`.

- **Accepted input forms**
  - `0x` + 40 hex chars.
  - Bare 40-character hex string.
- **Output**
  - `XKO` + 40 hex chars, preserving the checksum capitalization.
- **Errors**
  - `Address must be a string` if the input isn’t a string.
  - `Invalid address length`  if (after trimming/prefix removal) the length ≠ 40.
  - `Invalid hex characters in address` if the body contains non-hex characters.
