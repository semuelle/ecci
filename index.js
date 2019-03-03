const JSON5 = require('json5')

module.exports = function(embark) {
	let contractName;
	let contract;
	let accounts;
	let defaultAccount;

    embark.registerConsoleCommand(function(cmd, options) {
    	
		return {
			match: () => { 
				const cmdName = cmd.match(/".*?"|\S+/g);
				return (Array.isArray(cmdName) &&
						(cmdName[0] === 'send' || cmdName[0] === 'call') && 
						cmdName[1] === 'init')
			},
			process: async (callback) => {
				//console.log("CMD: init")
				const cmdName = cmd.match(/".*?"|\S+/g);
				if(!cmdName.length === 3) {
					help();
				} else {
					accounts = await web3.eth.getAccounts()
					defaultAccount = web3.eth.defaultAccount
					contractName = cmdName[2]
					embark.events.request('contracts:contract', contractName, async (cntrct) => {
						if (!cntrct || !cntrct.deployedAddress) {
							return callback("Could not find contract " + contractName + ".");
						}
						contract = new web3.eth.Contract(cntrct.abiDefinition, cntrct.address)
						console.log("ECCÌ set to interact with contract at " + contract._address + ".")
					});
				}
				return callback(null, "");	
			}
		};
	})

    embark.registerConsoleCommand(function(cmd, options) {
    	
		return {
			match: () => { 
				const cmdName = cmd.match(/".*?"|\S+/g);
				return (Array.isArray(cmdName) &&
						(cmdName[0] === 'send' || cmdName[0] === 'call') && 
						cmdName[1] === 'help')
			},
			process: async (callback) => {
				help();
				return callback(null, "");	
			}
		};
	})

    embark.registerConsoleCommand(function(cmd, options) {
		return {
			match: () => {
				const cmdName = cmd.match(/{.*?}|\S+/g);
				return (Array.isArray(cmdName) &&
						cmdName[0] === 'call')
			},
			process: async (callback) => {
				const cmdName = cmd.match(/{.*?}|\S+/g);
				if(!(cmdName.length >= 2 && cmdName.length <= 4)) {
					help();
					return callback(null, "")
				} else {
					let func = contract.methods[cmdName[1]]
					if(!func) {
						console.log("'" + cmdName[1] + "' is not a function of the contract at address " + contract._address + ".")
						return
					}
					let params = parseParams(cmdName[2]);
					let options = parseOptions(cmdName[3]);
					if(!params || params === "{}") {
						return callback(null, await func().call(options))
					} else {
						return callback(null, await func(...params).call(options))
					}
					
				}
			}
		};
	})

    embark.registerConsoleCommand(function(cmd, options) {
		return {
			match: () => { 
				const cmdName = cmd.match(/{.*?}|\S+/g);
				return (Array.isArray(cmdName) &&
						cmdName[0] === 'send')
			},
			process: async (callback) => {
				const cmdName = cmd.match(/{.*?}|\S+/g);
				if(!(cmdName.length >= 2 && cmdName.length <= 4)) {
					help();
					return callback(null, "")
				} else {
					let params = parseParams(cmdName[2]);
					let func = contract.methods[cmdName[1]]
					if(!func) {
						console.log("'" + cmdName[1] + "' is not a function of the contract at address " + contract._address + ".")
						return
					}
					let options = parseOptions(cmdName[3]);
					if(!params) {
						return callback(null, await func().send(options))
					} else {
						return callback(null, await func(...params).send(options))
					}
					
				}
			}
		};
	})

	function help() {
		console.log("Usage: [send|call] (init | <function> [params] [options])")
		console.log("")
		console.log("       where [params] are the function parameters")
		console.log("       and   [options] are the call/send parameters ('from', 'gas', etc.).")
		console.log("")
		console.log("Commands:")
		console.log("\tinit <name>\tDefine contract to interact with.")
		console.log("\tcall\t\tCall a constant contract function.")
		console.log("\tsend\t\tCall a non-constant contract function.")
		console.log("\thelp\t\tThis help.")
	}

	function parseParams(paramString) {
		if(!paramString || paramString === "{}")
			return;

		params = paramString.split(",")
		for(var i = 0; i < params.length; i++) {
			console.log(i, params[i])
			params[i] = params[i].replace(/["'{}]/g, '').trim()
			console.log(i, params[i])
		}

		params = params.map(obj => {
			let evaled = eval(obj)
			if(typeof evaled == 'number')
				return obj
			else return evaled
		});
		
		return params;
	}

	function parseOptions(optionsString) {
		if(!optionsString || optionsString === "{}") {
			let defaultAddress = eval(accounts[0])
			return JSON5.parse("{from: \"" + accounts[0] + "\"}");
		}

		options = JSON5.parse(optionsString, (key, value) => {
			let evaled = eval(value)
			//console.log("value", value)
			//console.log("evaled", evaled)
			if(typeof evaled == 'number')
				return value
			else return evaled
		})

		return options;
	}
}