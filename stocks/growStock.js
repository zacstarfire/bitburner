/** @param {NS} ns */
export async function main(ns) {
    let target = ns.args[0];

    let securityLevelMin;
    let currentSecurityLevel;
    let serverMaxMoney;
    let serverMoneyAvailable;

    let threadsUsedForStocks = ns.getRunningScript().threads;

    while (true) {
        securityLevelMin = ns.getServerMinSecurityLevel(target);
        currentSecurityLevel = ns.getServerSecurityLevel(target);

        while (currentSecurityLevel > securityLevelMin + 5) {
            await ns.weaken(target);
            
            currentSecurityLevel = ns.getServerSecurityLevel(target);
        }

        serverMoneyAvailable = ns.getServerMoneyAvailable(target);
        serverMaxMoney = ns.getServerMaxMoney(target);


        if (serverMoneyAvailable < (serverMaxMoney * 0.75)) {
            await ns.grow(target);

            serverMoneyAvailable = ns.getServerMoneyAvailable(target);
            serverMaxMoney = ns.getServerMaxMoney(target);
        }
        else
        {
            ns.print('threadsUsedForStocks:' + threadsUsedForStocks)

            await ns.grow(target, { stock: true, threads: threadsUsedForStocks});
        }

        await ns.sleep(2000);
    }
}
