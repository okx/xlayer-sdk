package com.okcoin;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class MultiAddressTest {
    private static final String RAW = "70586beeb7b7aa2e7966df9c8493c6cbfd75c625";
    private static final String CHECKSUM =
        "0x70586BeEB7b7Aa2e7966DF9c8493C6CbFd75C625";
    private static final String XKO =
        "XKO70586BeEB7b7Aa2e7966DF9c8493C6CbFd75C625";

    @Test
    void toEvmVariants() {
        assertEquals(CHECKSUM, MultiAddress.toEvmAddress("0x" + RAW));
        assertEquals(CHECKSUM, MultiAddress.toEvmAddress(RAW));
        assertEquals(CHECKSUM, MultiAddress.toEvmAddress("XKO" + RAW));
    }

    @Test
    void toEvmErrors() {
        IllegalArgumentException len = assertThrows(
            IllegalArgumentException.class,
            () -> MultiAddress.toEvmAddress("0x1234")
        );
        assertTrue(len.getMessage().contains("Invalid address length"));

        IllegalArgumentException hex = assertThrows(
            IllegalArgumentException.class,
            () -> MultiAddress.toEvmAddress("0xzbcdefabcdefabcdefabcdefabcdefabcdefabcd")
        );
        assertTrue(hex.getMessage().contains("Invalid hex characters"));
    }

    @Test
    void fromEvmVariants() {
        assertEquals(XKO, MultiAddress.fromEvmAddress("0x" + RAW));
        assertEquals(XKO, MultiAddress.fromEvmAddress(RAW));
    }

    @Test
    void fromEvmErrors() {
        IllegalArgumentException hex = assertThrows(
            IllegalArgumentException.class,
            () -> MultiAddress.fromEvmAddress("0xZZZDEFABCDEFABCDEFABCDEFABCDEFABCDEFABCD")
        );
        assertTrue(hex.getMessage().contains("Invalid hex characters"));
    }

    @Test
    void isXlayerAddressValid() {
        // Uppercase prefix
        assertTrue(MultiAddress.isXlayerAddress("XKO70586BeEB7b7Aa2e7966DF9c8493C6CbFd75C625"));
        assertTrue(MultiAddress.isXlayerAddress("XKO" + RAW));
        
        // Lowercase prefix
        assertTrue(MultiAddress.isXlayerAddress("xko70586BeEB7b7Aa2e7966DF9c8493C6CbFd75C625"));
        assertTrue(MultiAddress.isXlayerAddress("xko" + RAW));
        
        // Mixed case prefix
        assertTrue(MultiAddress.isXlayerAddress("Xko70586BeEB7b7Aa2e7966DF9c8493C6CbFd75C625"));
        assertTrue(MultiAddress.isXlayerAddress("XkO" + RAW));
        
        // With whitespace (should be trimmed)
        assertTrue(MultiAddress.isXlayerAddress("  XKO" + RAW + "  "));
        assertTrue(MultiAddress.isXlayerAddress("\tXKO" + RAW));
    }

    @Test
    void isXlayerAddressInvalid() {
        // Null input
        assertFalse(MultiAddress.isXlayerAddress(null));
        
        // Empty string
        assertFalse(MultiAddress.isXlayerAddress(""));
        assertFalse(MultiAddress.isXlayerAddress("   "));
        
        // Addresses without XKO prefix
        assertFalse(MultiAddress.isXlayerAddress("0x" + RAW));
        assertFalse(MultiAddress.isXlayerAddress(RAW));
        assertFalse(MultiAddress.isXlayerAddress(CHECKSUM));
        
        // Different prefix
        assertFalse(MultiAddress.isXlayerAddress("ETH" + RAW));
        assertFalse(MultiAddress.isXlayerAddress("BTC" + RAW));
        
        // XKO as substring (not prefix)
        assertFalse(MultiAddress.isXlayerAddress(RAW + "XKO"));
        assertFalse(MultiAddress.isXlayerAddress("0x" + RAW + "XKO"));
    }
}