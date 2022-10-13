/** @param {NS} ns */
export async function main(ns) {
	// Logging
	ns.disableLog('ALL');
	//ns.disableLog('scan');
	ns.tail();

	// Globals
	const solveContractScript = "/contracts/solvecontract.js";
	let infiniteLoopProtection = 9999;

	// Variables
	let discoveredServers = [];
	let serversToScan = ["home"];
	let contracts = [];


	ns.print("-------------------------------------------------------------");
	ns.print("Searching for servers...");

	while (serversToScan.length > 0 && infiniteLoopProtection-- > 0) {
		let purchasedServers = ns.getPurchasedServers();
		let currentServer = serversToScan.pop(); // Get the next host to be scanned

		for (const connectedServer of ns.scan(currentServer)) {
			if (!discoveredServers.includes(connectedServer)) {
				// Add hostname if not already added and not owned
				if (!purchasedServers.includes(connectedServer)) serversToScan.push(connectedServer);
			}
		}

		discoveredServers.push(currentServer);
	}

	ns.print(discoveredServers.length + " total servers found.");
	ns.print("-------------------------------------------------------------");

	for (const serverName of discoveredServers) {
		let contractsOnServer = 0;
		let files = ns.ls(serverName);

		//ns.print(files + "files on " + serverName);

		for (const fileName of files) {
			if (fileName.includes(".cct")) {
				let contract = {};

				contract.server = serverName;
				contract.type = ns.codingcontract.getContractType(fileName, serverName);
				contract.fileName = fileName;
				contract.data = ns.codingcontract.getData(fileName, serverName);

				contracts.push(contract);
				contractsOnServer += 1;
			}
		}

		ns.print(contractsOnServer + " contracts on " + serverName);
	}


	ns.print(contracts.length + " total contracts found.");
	ns.print("-------------------------------------------------------------");

	// Solve found contracts
	for (const contract of contracts) {
		let processID, scriptLog;

		ns.print("Solving " + contract.fileName + "...");

		// Use JSON Strigify function to pass an object to a script
		//	processID = ns.exec('/contracts/test.js', 'home', 1);
		processID = ns.run(solveContractScript, 1, JSON.stringify(contract));

		// Sleep a bit while process starts before pulling its log
		await ns.sleep(500);
		scriptLog = ns.getScriptLogs(solveContractScript, 'home', JSON.stringify(contract));

		//ns.print(scriptLog);

		// Display results from solving script to this script's tail window
		// Note: Log is returned as an array, so we have to loop through it
		for (let line of scriptLog){
			ns.print(line);
		}

		// Sleep a bit to prevent timeout while solving contract
		await ns.sleep(500);
	}

	ns.print("-------------------------------------------------------------");
	ns.print("Completed solving all " + contracts.length + " found contracts.");
}
