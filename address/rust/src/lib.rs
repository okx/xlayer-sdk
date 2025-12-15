use std::fmt;

use thiserror::Error;
use tiny_keccak::{Hasher, Keccak};

const OKX_PREFIX: &str = "XKO";

#[derive(Debug, Error)]
pub enum AddressError {
    #[error("address must be a string")]
    NotAString,
    #[error("invalid address length: expected 40 hex chars, got {0}")]
    InvalidLength(usize),
    #[error("invalid hex characters in address")]
    InvalidHex,
}

fn normalize_body(input: &str, allow_xko: bool) -> Result<String, AddressError> {
    let mut s = input.trim().to_lowercase();

    if s.is_empty() {
        return Err(AddressError::NotAString);
    }

    if s.starts_with("0x") {
        s.drain(..2);
    } else if allow_xko && s.starts_with(&OKX_PREFIX.to_lowercase()) {
        s.drain(..3);
    }

    if s.len() != 40 {
        return Err(AddressError::InvalidLength(s.len()));
    }

    if !s.chars().all(|c| c.is_ascii_hexdigit()) {
        return Err(AddressError::InvalidHex);
    }

    Ok(s)
}

fn to_checksum_address(body: &str) -> String {
    let body_lower = body.to_lowercase();
    let mut hasher = Keccak::v256();
    hasher.update(body_lower.as_bytes());
    let mut hash = [0u8; 32];
    hasher.finalize(&mut hash);

    let mut out = String::with_capacity(42);
    out.push_str("0x");

    for (i, ch) in body_lower.chars().enumerate() {
        let should_upper = (hash[i / 2] >> (4 * (1 - i % 2))) & 0xF >= 8;
        if should_upper {
            out.push(ch.to_ascii_uppercase());
        } else {
            out.push(ch);
        }
    }

    out
}

pub fn to_evm_address(input: &str) -> Result<String, AddressError> {
    let body = normalize_body(input, true)?;
    Ok(to_checksum_address(&body))
}

pub fn from_evm_address(input: &str) -> Result<String, AddressError> {
    let body = normalize_body(input, false)?;
    let checksum = to_checksum_address(&body);
    Ok(format!("{}{}", OKX_PREFIX, &checksum[2..]))
}

#[cfg(test)]
mod tests {
    use super::*;

    const RAW: &str = "70586beeb7b7aa2e7966df9c8493c6cbfd75c625";
    const CHECKSUM: &str = "0x70586BeEB7b7Aa2e7966DF9c8493C6CbFd75C625";
    const XKO: &str = "XKO70586BeEB7b7Aa2e7966DF9c8493C6CbFd75C625";

    #[test]
    fn to_evm_variants() {
        for input in [
            format!("0x{RAW}"),
            RAW.to_string(),
            format!("XKO{RAW}"),
        ] {
            let out = to_evm_address(&input).unwrap();
            assert_eq!(out, CHECKSUM, "failed for {}", input);
        }
    }

    #[test]
    fn to_evm_errors() {
        assert!(matches!(
            to_evm_address("0x1234"),
            Err(AddressError::InvalidLength(4))
        ));
        assert!(matches!(
            to_evm_address("0xzbcdefabcdefabcdefabcdefabcdefabcdefabcd"),
            Err(AddressError::InvalidHex)
        ));
    }

    #[test]
    fn from_evm_variants() {
        for input in [format!("0x{RAW}"), RAW.to_string()] {
            let out = from_evm_address(&input).unwrap();
            assert_eq!(out, XKO, "failed for {}", input);
        }
    }

    #[test]
    fn from_evm_errors() {
        assert!(matches!(
            from_evm_address("0xZZZDEFABCDEFABCDEFABCDEFABCDEFABCDEFABCD"),
            Err(AddressError::InvalidHex)
        ));
    }
}