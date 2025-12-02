package com.example;

import java.math.BigInteger;
import java.util.Locale;

import org.bouncycastle.jcajce.provider.digest.Keccak;

public final class MultiAddress {
    private static final String OKX_PREFIX = "XKO";

    private MultiAddress() {}

    public static String toEvmAddress(String input) {
        String body = normalizeBody(input, true);
        return toChecksumAddress(body);
    }

    public static String fromEvmAddress(String input) {
        String body = normalizeBody(input, false);
        String checksum = toChecksumAddress(body);
        return OKX_PREFIX + checksum.substring(2);
    }

    private static String normalizeBody(String input, boolean allowOkxPrefix) {
        if (input == null) {
            throw new IllegalArgumentException("Address must be a string");
        }

        String s = input.trim().toLowerCase(Locale.ROOT);

        if (s.startsWith("0x")) {
            s = s.substring(2);
        } else if (allowOkxPrefix && s.startsWith(OKX_PREFIX.toLowerCase(Locale.ROOT))) {
            s = s.substring(3);
        }

        if (s.length() != 40) {
            throw new IllegalArgumentException(
                "Invalid address length: expected 40 hex chars, got " + s.length()
            );
        }

        if (!s.matches("^[0-9a-f]{40}$")) {
            throw new IllegalArgumentException("Invalid hex characters in address");
        }

        return s;
    }

    private static String toChecksumAddress(String body) {
        String lower = body.toLowerCase(Locale.ROOT);
        Keccak.Digest256 keccak = new Keccak.Digest256();
        keccak.update(lower.getBytes());
        byte[] hash = keccak.digest();
        StringBuilder out = new StringBuilder("0x");

        for (int i = 0; i < lower.length(); i++) {
            char c = lower.charAt(i);
            int hashNibble = (hash[i / 2] >> (4 * (1 - (i % 2)))) & 0xF;
            if (Character.digit(c, 16) >= 10 && hashNibble >= 8) {
                out.append(Character.toUpperCase(c));
            } else {
                out.append(c);
            }
        }
        return out.toString();
    }
}