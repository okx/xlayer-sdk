import unittest

from multi_address import to_evm_address, from_evm_address

RAW = "70586beeb7b7aa2e7966df9c8493c6cbfd75c625"
CHECKSUM = "70586BeEB7b7Aa2e7966DF9c8493C6CbFd75C625"
EVM = f"0x{CHECKSUM}"


class MultiAddressTests(unittest.TestCase):
    def test_to_evm_already_prefixed(self):
        self.assertEqual(to_evm_address(f"0x{RAW}"), EVM)

    def test_to_evm_bare_hex(self):
        self.assertEqual(to_evm_address(RAW), EVM)

    def test_to_evm_xko_prefixed(self):
        self.assertEqual(to_evm_address(f"XKO{RAW}"), EVM)

    def test_to_evm_length_error(self):
        with self.assertRaisesRegex(ValueError, "Invalid address length"):
            to_evm_address("0x1234")

    def test_to_evm_invalid_chars(self):
        with self.assertRaisesRegex(ValueError, "Invalid hex characters"):
            to_evm_address("0xzbcdefabcdefabcdefabcdefabcdefabcdefabcd")

    def test_to_evm_type_error(self):
        with self.assertRaisesRegex(TypeError, "Address must be a string"):
            to_evm_address(123)  # type: ignore[arg-type]

    def test_from_evm_prefixed(self):
        self.assertEqual(from_evm_address(f"0x{RAW}"), f"XKO{CHECKSUM}")

    def test_from_evm_bare(self):
        self.assertEqual(from_evm_address(RAW), f"XKO{CHECKSUM}")

    def test_from_evm_type_error(self):
        with self.assertRaisesRegex(TypeError, "Address must be a string"):
            from_evm_address(123)  # type: ignore[arg-type]

    def test_from_evm_invalid_hex(self):
        with self.assertRaisesRegex(ValueError, "Invalid hex characters"):
            from_evm_address("0xZZZDEFABCDEFABCDEFABCDEFABCDEFABCDEFABCD")


if __name__ == "__main__":
    unittest.main()