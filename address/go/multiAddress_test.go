package address_test

import (
	"testing"

	"github.com/stretchr/testify/require"

	"multi_address"
)

const (
	raw      = "70586beeb7b7aa2e7966df9c8493c6cbfd75c625"
	checksum = "0x70586BeEB7b7Aa2e7966DF9c8493C6CbFd75C625"
	xko      = "XKO70586BeEB7b7Aa2e7966DF9c8493C6CbFd75C625"
)

func TestToEvmAddress(t *testing.T) {
	tests := []struct {
		name string
		in   string
		want string
	}{
		{"0x prefixed", "0x" + raw, checksum},
		{"bare hex", raw, checksum},
		{"XKO prefixed", "XKO" + raw, checksum},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := address.ToEvmAddress(tt.in)
			require.NoError(t, err)
			require.Equal(t, tt.want, got)
		})
	}

	_, err := address.ToEvmAddress("0x1234")
	require.ErrorContains(t, err, "invalid address length")

	_, err = address.ToEvmAddress("0xzbcdefabcdefabcdefabcdefabcdefabcdefabcd")
	require.ErrorContains(t, err, "invalid hex characters")
}

func TestFromEvmAddress(t *testing.T) {
	tests := []struct {
		name string
		in   string
		want string
	}{
		{"0x prefixed", "0x" + raw, xko},
		{"bare hex", raw, xko},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := address.FromEvmAddress(tt.in)
			require.NoError(t, err)
			require.Equal(t, tt.want, got)
		})
	}

	_, err := address.FromEvmAddress("0xZZZDEFABCDEFABCDEFABCDEFABCDEFABCDEFABCD")
	require.ErrorContains(t, err, "invalid hex characters")
}