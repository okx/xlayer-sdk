# Description
This repo contains multi language sdk for interacting with xlayer blockchain. Currently, we provide custom support for below functionalities
- `XKO` prefixed address

# XKO prefixed address
XLayer supports both normal evm address, and `XKO` prefixed address (case insensitive). as an example, for this evm address `0x70586BeEB7b7Aa2e7966DF9c8493C6CbFd75C625`, below are all valid address.
- XKO70586BeEB7b7Aa2e7966DF9c8493C6CbFd75C625 (XKO prefix)
- xko70586beeb7b7aa2e7966df9c8493c6cbfd75c625 (XKO prefix lower case)
- Xko70586beeb7b7aa2e7966df9c8493c6cbfd75c625 (mixed upper & lower case)

below are invalid address
- XKO0x70586BeEB7b7Aa2e7966DF9c8493C6CbFd75C625

to better facilitate users use multiple address format. we provide util functions to support conversion between standard evm address and XLayer address.
Below languages are supported 
- js 
- ts
- py 
- go 
- rust 
- java

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


## rpc support
XLayer rpc api also supports usage of XLayer address
- eth_getBalance
```
curl -X POST http://localhost:8545 \
     -H "Content-Type: application/json" \
     -d '{
           "jsonrpc":"2.0",
           "method":"eth_getBalance",
           "params":["XKOf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "latest"],
           "id":1
         }'
```

- eth_getTransactionCount
```
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
        "jsonrpc":"2.0",
        "method":"eth_getTransactionCount",
        "params":[
          "XKOf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "latest"
        ],
        "id":1
      }'
```

## security 
if one send a transaction with `from` or `to` address to be `XKO` prefixed address directly to xlayer blockchain network, though most sdk will reject such behaviours, one can manually create such tx as according to the `rlp` serialization spec. the chain will reject such transaction upon receiving the transaction.  
the code snippet below from crate `alloy-primitives` will reject the transaction because `<Address as Decodable>::decode(buf)` with a `buf` not the size of 40 will fail.
```rs
#[cfg(feature = "rlp")]
impl Decodable for TxKind {
    fn decode(buf: &mut &[u8]) -> alloy_rlp::Result<Self> {
        if let Some(&first) = buf.first() {
            if first == EMPTY_STRING_CODE {
                buf.advance(1);
                Ok(Self::Create)
            } else {
                let addr = <Address as Decodable>::decode(buf)?;
                Ok(Self::Call(addr))
            }
        } else {
            Err(alloy_rlp::Error::InputTooShort)
        }
    }
}
```

a transaction could be created as below
```ts

import { Wallet,encodeRlp, getBytes, keccak256, toBeHex, } from "ethers.js";
 const wallet = new Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
        const tx = [
            // chainId
            getBytes(toBeHex(1337)),
            // nonce
            getBytes(toBeHex(3)),
            // maxPriorityFeePerGas
            getBytes(toBeHex(1_000_000)),
            // maxFeePerGas
            getBytes(toBeHex(2_000_000_000)),
            // gasLimit
            getBytes(toBeHex(21000)),
            // to (20 bytes!)
            getBytes("0x11f39fd6e51aad88f6f4ce6ab8827279cfffb92266"),
            // value
            getBytes(toBeHex(1)),
            // data
            new Uint8Array(),
            // accessList empty
            [],
        ];
        
        const rlpPayload = getBytes(encodeRlp(tx));
        const unsignedTx = new Uint8Array([0x02, ...rlpPayload]);
        const msgHash = keccak256(unsignedTx);

        const signature = wallet.signingKey.sign(getBytes(msgHash));

        const { r, s, yParity } = signature;

        const signedTxBytes = encodeRlp([
            ...tx,
            new Uint8Array([yParity]),
            getBytes(toBeHex(r)),
            getBytes(toBeHex(s))
          ]);

        const rawTx = "0x02" + signedTxBytes.slice(2);
        console.log("Raw Transaction:", rawTx);
```