//
// Imports
//
import { companyMeta } from '/stocks/companyMeta.js';
import * as lib from '/stocks/lib.js';

/** @param {NS} ns */
export async function main(ns) {
	//
	// Logging
	//
	ns.disableLog('ALL');
	ns.clearLog();
	ns.tail();


	//
	// Globals
	//
	const scriptTimer = 2000; // Time script waits
	//const moneyKeep = 1000000000; // Failsafe Money
	const moneyKeep = 1000000000;

	const stockBuyOver_Long = 0.60; // Buy stocks when forcast is over this % 
	const stockBuyUnder_Short = 0.40; // Buy shorts when forcast is under this % 
	const stockVolatility = 0.05; // Stocks must be under this volatility 
	const minSharePercent = 5;
	const maxSharePercent = 1.00;
	const sellThreshold_Long = 0.55; // Sell Long when chance of increasing is under this
	const sellThreshold_Short = 0.40; // Sell Short when chance of increasing is under this
	const shortUnlock = false;  // Set true when short stocks are available to player
	const minSharesToBuy = 1500;  // Tweek this as needed

	const toastDuration = 15000;   // Toast message duration

	const dots = ['.', '..', '...', '....']
	let indexDots = 0;

	const growServer = "home";  // You want to run this on home unless you modify it
	const growScript = '/stocks/growStock.js';  // The grow() script
	//let growThreads = 1000000;  //  How many threads max to use for slaved grow() scripts
	let growThreads = 10000000

	let sharesBought = false;
	let totalIncome = 0;

	//
	// Functions
	//
	function buyPositions(stock) {
		let position = ns.stock.getPosition(stock);
		let maxShares = (ns.stock.getMaxShares(stock) * maxSharePercent) - position[0];
		let maxSharesShort = (ns.stock.getMaxShares(stock) * maxSharePercent) - position[2];
		let askPrice = ns.stock.getAskPrice(stock);
		let forecast = ns.stock.getForecast(stock);
		let volatilityPercent = ns.stock.getVolatility(stock);
		let playerMoney = ns.getPlayer().money;


		// Look for Long Stocks to buy
		if (forecast >= stockBuyOver_Long && volatilityPercent <= stockVolatility) {
			if (playerMoney - moneyKeep > ns.stock.getPurchaseCost(stock, minSharePercent, "Long")) {
				let shares = Math.min((playerMoney - moneyKeep - 100000) / askPrice, maxShares);
				let boughtFor = 0;

				if (shares >= minSharesToBuy) boughtFor = ns.stock.buyStock(stock, shares);

				if (boughtFor > 0) {
					const message = 'Bought ' + Math.round(shares) + ' Long shares of ' + stock + ' for ' + lib.formatReallyBigNumber(ns, boughtFor);
					const company = companyMeta.find(company => company.stockSymbol === stock);

					ns.toast(message, 'success', toastDuration);

					// Check for company and server
					if (company && company.serverName.length > 0) {
						// Check if company has a server
						if (company.serverName != 'NoServer') {
							if (ns.hasRootAccess(company.serverName)) {
								let ramAvailable = ns.getServerMaxRam(growServer) - ns.getServerUsedRam(growServer);
								let ramPerThread = ns.getScriptRam(growScript);
								let growThreadsPossible = Math.floor(ramAvailable / ramPerThread);

								// Get number of threads needed to double the money on the server
								let growThreadsNeeded = ns.growthAnalyze(growServer, 2, ns.getServer(growServer).cpuCores)

								// Don't use more threads than set in header
								if (growThreadsPossible < growThreads) growThreads = growThreadsPossible;

								// Use only the threads actually needed for grow()
								if (growThreads > growThreadsNeeded) growThreads = growThreadsNeeded;

								// Check if RAM is available
								if (growThreads < growThreadsPossible) {
									// Start grow on home
									ns.run(growScript, growThreads, company.serverName);
								}
								else {
									ns.tprint("WARNING- Not enough RAM available on home to execute grow() for " + company.serverName);
								}
							}
							else {
								//ns.tprint("WARNING- No root access for: " + company.serverName);
							}
						}
					}
					else {
						ns.tprint("WARNING- No server defined for: " + stock);
					}
				}
			}


			// Look for Short Stocks to buy
			if (shortUnlock) {
				if (forecast <= stockBuyUnder_Short && volatilityPercent <= stockVolatility) {
					if (playerMoney - moneyKeep > ns.stock.getPurchaseCost(stock, minSharePercent, "Short")) {
						let shares = Math.min((playerMoney - moneyKeep - 100000) / askPrice, maxSharesShort);
						let boughtFor = ns.stock.buyShort(stock, shares);

						if (boughtFor > 0) {
							let message = 'Bought ' + Math.round(shares) + ' Short shares of ' + stock + ' for ' + lib.formatReallyBigNumber(ns, boughtFor);

							ns.toast(message, 'success', toastDuration);
						}
					}
				}
			}
		}
	}

	function sellIfOutsideThreshdold(stock) {
		let position = ns.stock.getPosition(stock);
		let forecast = ns.stock.getForecast(stock);

		if (position[0] > 0) {
			let symbolRepeat = Math.floor(Math.abs(forecast * 10)) - 4;
			let plusOrMinus = true ? 50 + symbolRepeat : 50 - symbolRepeat;
			let forcastDisplay = (plusOrMinus ? "+" : "-").repeat(Math.abs(symbolRepeat));
			let profit = position[0] * (ns.stock.getBidPrice(stock) - position[1]) - (200000);

			const company = companyMeta.find(company => company.stockSymbol === stock);

			// Output stock info & forecast
			ns.print(' ' + company.companyName + ' (' + company.serverName + ')');
			ns.print(' ' + stock + ' 4S Forecast -> ' + (Math.round(forecast * 100) + '%   ' + forcastDisplay));
			ns.print('         Position -> ' + ns.nFormat(position[0], '0.00a'));
			//ns.print('         Volatility -> ' + (ns.stock.getVolatility(stock) * 100) + '%');
			ns.print('         Profit -> ' + lib.formatReallyBigNumber(ns, profit));
			ns.print("-----------------------------------------------");

			// Check if we need to sell Long stocks
			if (forecast < sellThreshold_Long) {
				let soldFor = ns.stock.sellStock(stock, position[0]);
				let message = 'Sold ' + position[0] + ' Long shares of ' + stock + ' for ' + ns.nFormat(soldFor, '$0.000a');
				let longShares = position[0];
				let longPrice = position[1];
				let bidPrice = ns.stock.getBidPrice(stock);

				// Calculate profit minus commision fees
				let profit = longShares * (bidPrice - longPrice) - (2 * 100000);
				totalIncome += profit;

				const company = companyMeta.find(company => company.stockSymbol === stock);

				ns.toast(message, 'success', toastDuration);

				// Check for server
				if (company.serverName.length > 0) {
					// Kill grow on home
					ns.kill(growScript, 'home', company.serverName);
				}
				else {
					ns.tprint("WARNING- No server found for: " + company.companyName);
				}
			}
		}

		if (shortUnlock) {
			// Check if we need to sell Short stocks
			if (position[2] > 0) {
				ns.print(stock + ' 4S Forecast -> ' + forecast.toFixed(2));

				// Check if we need to sell Short stocks
				if (forecast > sellThreshold_Short) {
					let soldFor = ns.stock.sellShort(stock, position[2]);
					let message = 'Sold ' + stock + ' Short shares of ' + stock + ' for ' + ns.nFormat(soldFor, '$0.000a');

					ns.toast(message, 'success', toastDuration);
				}
			}
		}
	}

	// Main Loop
	while (true) {
		// Get stocks in order of favorable forcast
		let orderedStocks = ns.stock.getSymbols().sort(function (a, b) { return Math.abs(0.5 - ns.stock.getForecast(b)) - Math.abs(0.5 - ns.stock.getForecast(a)); })
		let currentWorth = 0;
		let totalProfit = 0;
		let dot = dots[indexDots];

		ns.print("===============================================");

		for (const stock of orderedStocks) {
			const position = ns.stock.getPosition(stock);

			// Check if we have stock in the position
			if (position[0] > 0 || position[2] > 0) {

				// Check if we need to sell
				sellIfOutsideThreshdold(stock);
			}

			// Check if we should buy
			buyPositions(stock);

			// Track out current profit over time
			if (position[0] > 0 || position[2] > 0) {
				let longShares = position[0];
				let longPrice = position[1];
				let shortShares = position[2];
				let shortPrice = position[3];
				let bidPrice = ns.stock.getBidPrice(stock);

				// Calculate profit minus commision fees
				let profit = longShares * (bidPrice - longPrice) - (2 * 100000);
				let profitShort = shortShares * Math.abs(bidPrice - shortPrice) - (2 * 100000);

				// Calculate total profit, total income & net worth
				totalProfit += profit;
				currentWorth += profitShort + profit + (longShares * longPrice) + (shortShares * shortPrice);
			}
		}

		// Output Script Status
		const progress = Math.max(Math.min(ns.getServerUsedRam('home') / ns.getServerMaxRam('home'), 1), 0);
		const bars = Math.max(Math.floor(progress / (1 / 20)), 1);
		const dashes = Math.max(20 - bars, 0);

		let barOutput = '[' + "|".repeat(bars) + "-".repeat(dashes) + "]";
		let prefix = '';

		if (bars > 16) prefix = 'WARNING- ';
		else if (bars > 18) prefix = 'ERROR- ';
		else prefix = '         ';

		let stockIncome = ns.getScriptIncome(ns.getRunningScript().filename) * 3600;

		ns.print(' Current Stock Worth: ' + lib.formatReallyBigNumber(ns, currentWorth));
		ns.print('         Total Profit: ' + lib.formatReallyBigNumber(ns, totalProfit));
		ns.print('         Total Income: ' + lib.formatReallyBigNumber(ns, totalIncome) + ' ($' + ns.nFormat(stockIncome, '0.0a') + '/hr)');
		ns.print('         Net Worth: ' + lib.formatReallyBigNumber(ns, currentWorth + ns.getPlayer().money));
		ns.print(prefix + 'Server RAM: ' + barOutput);
		ns.print("-----------------------------------------------");
		ns.print(' ' + new Date().toLocaleTimeString() + ' - Running ' + dot);
		ns.print("===============================================");

		await ns.sleep(scriptTimer);

		// Upadate progress dots
		indexDots = indexDots >= dots.length - 1 ? 0 : indexDots + 1;

		// Clearing log makes the display more static
		// If you need the stock history, save it to a file
		ns.clearLog()
	}
}
