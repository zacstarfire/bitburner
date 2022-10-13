/** @param {NS} ns */
export async function main(ns) {
    let factionToSearchFor = ns.args[0];

    let discoveredHosts = []; // Hosts (a.k.a. servers) we have scanned
    let hostsToScan = ["home"]; // Hosts we know about, but have no yet scanned
    let infiniteLoopProtection = 9999; // In case you mess with this code, this should save you from getting stuck

    let files;
    let factionContractsFound = 0;
    let totalContractsCount = 0;
    let totalFactionCount = 0;

    // Search Related
    let searchContractsFound = 0;
    let contractServersFound = [];

    // Faction Counts
    let omniTekIncorporatedCount = 0;
    let carmichaelSecurityCount = 0;
    let alphaEnterprisesCount = 0;
    let megaCorpCount = 0;
    let sector12Count = 0;
    let tianDiHuiCount = 0;
    let bladeIndustriesCount = 0;
    let nationalSecurityAgencyCount = 0;
    let netburnersCount = 0;
    let niteSecCount = 0;
    let aevumCount = 0;
    let centralIntelligenceAgencyCount = 0;
    let cyberSecCount = 0;
    let theBlackHandCount = 0;
    let bitRunnersCount = 0;
    let otherContractsCount = 0;

    if (!factionToSearchFor) factionToSearchFor = "";




    while (hostsToScan.length > 0 && infiniteLoopProtection-- > 0) { // Loop until the list of hosts to scan is empty
        let hostName = hostsToScan.pop(); // Get the next host to be scanned
        for (const connectedHost of ns.scan(hostName)) // "scan" (list all hosts connected to this one)
            if (!discoveredHosts.includes(connectedHost)) // If we haven't already scanned this host
                hostsToScan.push(connectedHost); // Add it to the queue of hosts to be scanned
        discoveredHosts.push(hostName); // Mark this host as "scanned"

        files = ns.ls(hostName);

        //ns.tprint(files);

        for (const fileName of files) {
            if (fileName.includes(".cct")) {
                totalContractsCount += 1;

                //ns.tprint(fileName);

                if (fileName.includes('OmniTekIncorporated')) {
                    omniTekIncorporatedCount += 1;
                    totalFactionCount += 1;
                } else if (fileName.includes('CarmichaelSecurity')) {
                    carmichaelSecurityCount += 1;
                    totalFactionCount += 1;
                } else if (fileName.includes('AlphaEnterprises')) {
                    alphaEnterprisesCount += 1;
                    totalFactionCount += 1;
                } else if (fileName.includes('MegaCorp')) {
                    megaCorpCount += 1;
                    totalFactionCount += 1;
                } else if (fileName.includes('Sector-12')) {
                    sector12Count += 1;
                    totalFactionCount += 1;
                } else if (fileName.includes('TianDiHui')) {
                    tianDiHuiCount += 1;
                    totalFactionCount += 1;
                } else if (fileName.includes('BladeIndustries')) {
                    bladeIndustriesCount += 1;
                    totalFactionCount += 1;
                } else if (fileName.includes('Sector-12')) {
                    omniTekIncorporatedCount += 1;
                    totalFactionCount += 1;
                } else if (fileName.includes('NationalSecurityAgency')) {
                    nationalSecurityAgencyCount += 1;
                    totalFactionCount += 1;
                } else if (fileName.includes('Netburners')) {
                    netburnersCount += 1;
                    totalFactionCount += 1;
                } else if (fileName.includes('NiteSec')) {
                    niteSecCount += 1;
                    totalFactionCount += 1;
                } else if (fileName.includes('Aevum')) {
                    aevumCount += 1;
                    totalFactionCount += 1;
                } else if (fileName.includes('CentralIntelligenceAgency')) {
                    centralIntelligenceAgencyCount += 1;
                    totalFactionCount += 1;
                } else if (fileName.includes('CyberSec')) {
                    cyberSecCount += 1;
                    totalFactionCount += 1;
                } else if (fileName.includes('TheBlackHand')) {
                    theBlackHandCount += 1;
                    totalFactionCount += 1;
                } else if (fileName.includes('BitRunners')) {
                    bitRunnersCount += 1;
                    totalFactionCount += 1;
                } else {
                    otherContractsCount += 1;

                    if (factionToSearchFor == 'other' && !contractServersFound.includes(hostName)) {
                        searchContractsFound += 1;
                        contractServersFound.push(hostName);
                    }
                }

                if (fileName.includes(factionToSearchFor)) {
                    searchContractsFound += 1;
                    if (!contractServersFound.includes(hostName)) contractServersFound.push(hostName);
                }
            }
        }
    }


    //ns.tprint("discoveredHosts: " + discoveredHosts);
    ns.tprint("------------------------------------");
    ns.tprint("Searching Contracts ....");
    ns.tprint("------------------------------------");

    ns.tprint("Sector-12: " + sector12Count);
    ns.tprint("Aevum: " + aevumCount);
    ns.tprint("TianDiHui: " + tianDiHuiCount);
    ns.tprint("");
    ns.tprint("Netburners: " + netburnersCount);
    ns.tprint("NiteSec: " + niteSecCount);
    ns.tprint("The Black Hand: " + theBlackHandCount);
    ns.tprint("BitRunners: " + bitRunnersCount)
    ns.tprint("");
    ns.tprint("OmniTek Incorporated: " + omniTekIncorporatedCount);
    ns.tprint("Carmichael Security: " + carmichaelSecurityCount);
    ns.tprint("Alpha Enterprises: " + alphaEnterprisesCount);
    ns.tprint("MegaCorp: " + megaCorpCount);
    ns.tprint("CyberSec: " + cyberSecCount);
    ns.tprint("");
    ns.tprint("National Security Agency: " + nationalSecurityAgencyCount);
    ns.tprint("Central Intelligence Agency: " + centralIntelligenceAgencyCount);
    ns.tprint("-------------------------------------------------------------");
    ns.tprint("Other Contracts: " + otherContractsCount);
    ns.tprint("Faction Contracts: " + totalFactionCount);
    ns.tprint("Total Contracts: " + totalContractsCount);

    if (factionToSearchFor.length > 0) {
        if (searchContractsFound > 0) {
            ns.tprint("-------------------------------------------------------------");
            ns.tprint(searchContractsFound + " contracts found for " + factionToSearchFor + " !!!!");
            ns.tprint("On servers: " + contractServersFound);
        }
        else {
            ns.tprint("No contracts found for " + factionToSearchFor + ".");
        }
    }
}
