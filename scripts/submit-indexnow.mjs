import { readFile } from "node:fs/promises";

const host = "littlefightnyc.com";
const key = (await readFile("indexnow-key.txt", "utf8")).trim();
const keyLocation = `https://${host}/${key}.txt`;

function urlsFromSitemap(xml) {
  return [...xml.matchAll(/<loc>(https:\/\/littlefightnyc\.com\/[^<]+)<\/loc>/g)].map((match) => match[1]);
}

const urls = process.argv.slice(2);
const urlList = urls.length ? urls : urlsFromSitemap(await readFile("sitemap.xml", "utf8"));

if (!key || key.length < 8) {
  throw new Error("IndexNow key is missing or too short.");
}

if (!urlList.length) {
  throw new Error("No URLs to submit to IndexNow.");
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host,
    key,
    keyLocation,
    urlList,
  }),
});

if (!response.ok) {
  const body = await response.text();
  throw new Error(`IndexNow submission failed: ${response.status} ${body}`);
}

console.log(`Submitted ${urlList.length} URL(s) to IndexNow.`);
