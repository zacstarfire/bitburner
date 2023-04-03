/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog('ALL');
	ns.clearLog();
	ns.tail();

	let server = ns.args[0];
	let refreshRate = 2000;

	//const spinners = ['-', '\\', '|', '/']
	const spinners = ['   <>', '  <<>>', ' <<<>>>', '<<<<>>>>']
	const dots = ['.', '..', '...', '....']
	let indexSpinner = 0;
	let indexDots = 0;

	while (true) {
		let serverCurrentSecurity = ns.getServerSecurityLevel(server);
		const serverMinSecurity = ns.getServerMinSecurityLevel(server);
		const serverMaxMoney = ns.getServerMaxMoney(server);

		let serverCurrentMoney = ns.getServerMoneyAvailable(server);
		if (serverCurrentMoney === 0) serverCurrentMoney = 1;

		let moneyPercent = (serverCurrentMoney / serverMaxMoney * 100).toFixed(2);
		let weakenThreads = Math.ceil((serverCurrentSecurity - serverMinSecurity) * 20);
		let growThreads = Math.ceil(ns.growthAnalyze(server, serverMaxMoney / serverCurrentMoney));
		let growThreadsHome = Math.ceil(ns.growthAnalyze(server, serverMaxMoney / serverCurrentMoney, ns.getServer().cpuCores));
		let hackThreads = Math.ceil(ns.hackAnalyzeThreads(server, serverCurrentMoney));
		let hackChance = ns.hackAnalyzeChance(server) * 100;
		let moneyStolenPerThread = (ns.hackAnalyze(server) * 100).toFixed(2);

		let spinner = spinners[indexSpinner];
		let dot = dots[indexDots];
		
		ns.print("=============================================");
		ns.print(` Server: ${server}`);
		ns.print(` Money: ${ns.nFormat(serverCurrentMoney, "$0.000a")} / ${ns.nFormat(serverMaxMoney, "$0.000a")} (${moneyPercent}%)`);
		ns.print(` Hack Chance: ${hackChance}%`);
		ns.print(` Security: +${(serverCurrentSecurity - serverMinSecurity).toFixed(2)}`);
		ns.print(` Weaken -> ${ns.tFormat(ns.getWeakenTime(server))} (t=${weakenThreads})`);
		ns.print(` Grow   -> ${ns.tFormat(ns.getGrowTime(server))} (t=${growThreads}/core, t=${growThreadsHome}/${ns.getServer().cpuCores} cores)`);
		ns.print(` Hack   -> ${ns.tFormat(ns.getHackTime(server))} (t=${hackThreads}) ${moneyStolenPerThread}% / thread`);
		
		ns.print("---------------------------------------------");
		ns.print(` Running ${dot}${spinner}`);
		ns.print("=============================================");

		await ns.sleep(refreshRate);

		indexSpinner = indexSpinner >= spinners.length - 1 ? 0 : indexSpinner + 1;
		indexDots = indexDots >= dots.length - 1 ? 0 : indexDots + 1;

		ns.clearLog();
	}
}
