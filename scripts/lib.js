//
//
//  api.js
//
//

const extraFormats = [1e15, 1e18, 1e21, 1e24, 1e27, 1e30];
const extraNotations = ["q", "Q", "s", "S", "o", "n"];
const decimalPlaces = 3;

// Use nFormat for normal values
export function format(ns, number) {
	if (Math.abs(number) < 1e-6) {
		number = 0;
	}

	const answer = ns.nFormat(number, '$0.000a');;

	if (answer === "NaN") {
		return `${number}`;
	}

	return answer;
}

// numeral.js doesn't properly format numbers that are too big or too small
// So, we supply our own function for values over 't'
export function formatReallyBigNumber(ns, number) {
	if (number === Infinity) return "∞";

	for (let i = 0; i < extraFormats.length; i++) {
		if (extraFormats[i] < number && number <= extraFormats[i] * 1000) {
			return format(ns, number / extraFormats[i], "0." + "0".repeat(decimalPlaces)) + extraNotations[i];
		}
	}

	if (Math.abs(number) < 1000) {
		return format(ns, number, "0." + "0".repeat(decimalPlaces));
	}

	const str = format(ns, number, "0." + "0".repeat(decimalPlaces) + "a");

	if (str === "NaN") return format(ns, number, "0." + " ".repeat(decimalPlaces) + "e+0");

	return str;
}
