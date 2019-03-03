# ECCÌ: Embark Console Contract Interaction

Status Embark plugin to make interaction with smart contracts a little easier. So instead of this

```
await MyERC20.methods.mint("0x6DC4Ae6F756287DA58EE29a0fba6676718EfC496", 100).send({ "from": "0x6DC4Ae6F756287DA58EE29a0fba6676718EfC496" })
```

you can do this:

```
send mint { accounts[0], 100 }
```


## Usage

1. Call the `init` function (`call init` or `send init`) to declare which contract you wish to interact with. Must be the contract's name. 

```
call init MyERC20 
```

You can only interact with one contract at a time. Subsequent `init` calls will override the address you are interacting with.

2. Use `call` for constant functions, `send` for non-constant functions. Example:

```
call allowance { 0x2245EE61ee5Dbe58CEee388431A34E5e700A6a95, 0x2245EE61ee5Dbe58CEee388431A34E5e700A6a95 }
call owner
call balanceOf 0x2245EE61ee5Dbe58CEee388431A34E5e700A6a95 { from: "accounts[1]" }
send pause {} { from: "accounts[0]", gas: 100000 }
send mint { accounts[0], 100 } { from: "accounts[0]" }
```

## Notes

#### Function parameters must be wrapped in curly braces if there is more than one, e.g.

```
call allowance { 0x2245EE61ee5Dbe58CEee388431A34E5e700A6a95, 0x2245EE61ee5Dbe58CEee388431A34E5e700A6a95 }
```

#### `call` and `send` options must always be wrapped in curly braces and follow JSON syntax.

#### To call a function with options but no parameters, include empty braces in the call for the parameters:

```
send pause {} { from: "accounts[0]", gas: 100000 }
```


### web3.js variables

You can use `web3.eth.defaultAccount` and `accounts` (1-10) like in your regular Embark code instead of having to provide literal addresses.


### Single quotes, double quotes, no quotes

ECCÌ uses [JSON5](https://json5.org/), so JSON keys may be unquoted. Values must be either single- or double-quoted.