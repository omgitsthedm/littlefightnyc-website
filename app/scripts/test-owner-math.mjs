#!/usr/bin/env node
/** Lightweight pure-formula regression test; intentionally needs no browser or analytics. */
import { readFile } from "node:fs/promises";
import { transform } from "esbuild";

const source = await readFile(new URL("../src/components/dataviz/ownerMath.ts", import.meta.url), "utf8");
const { code } = await transform(source, { loader: "ts", format: "esm", target: "es2022" });
const math = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);

const equal = (actual, expected, label) => {
  if (actual !== expected) throw new Error(`${label}: expected ${expected}, got ${actual}`);
};

equal(math.missedInquiryValue({ missedPerWeek: 3, averageSale: 500, closeRatePercent: 40 }), 2400, "missed inquiry scenario");
equal(math.copyPasteTax({ people: 2, hoursPerWeek: 5, hourlyCost: 30 }), 15600, "copy-paste tax");
equal(math.downtimeCost({ hoursDown: 2, salesPerOpenHour: 300, affectedSharePercent: 50 }), 300, "downtime cost");
equal(math.subscriptionTotal([{ monthlyCost: 39, seats: 3 }, { monthlyCost: 24, seats: 2 }]), 165, "subscription stack");
equal(math.breakEvenCustomers({ projectCost: 3000, contributionPerCustomer: 500 }), 6, "break-even count");
equal(math.breakEvenCustomers({ projectCost: 3000, contributionPerCustomer: 0 }), null, "break-even zero guard");
equal(math.checkoutExposure({ checkoutStarts: 100, completedOrders: 72, averageOrderValue: 50 }).incompleteOrderValue, 1400, "checkout exposure");
equal(Math.round(math.checkoutExposure({ checkoutStarts: 100, completedOrders: 72, averageOrderValue: 50 }).completionRatePercent), 72, "checkout completion rate");
equal(math.clampNumber(-1), 0, "negative guard");
console.log("PASS owner-math — pure owner-input formulas return expected values.");
