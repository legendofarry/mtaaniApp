import { parseSMS } from "../src/services/sms.service.js";

const sample = `Mtr:22214069456
Token:5140-8662-1430-0580-3155
Date:20251221 22:01
Units:5.1
Amt:100.00
TknAmt:61.13
OtherCharges:38.87
For Details dial *977#`;

console.log("sample:", sample);
console.log("parsed:", parseSMS(sample));
