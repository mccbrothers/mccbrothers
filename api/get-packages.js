export default async function handler(req, res) {
    const { gameId } = req.query;
    // আপনার মূল শিট আইডি ব্যবহার করে ডাইরেক্ট লিঙ্ক
    const BASE = "https://docs.google.com/spreadsheets/d/1l_P0T1okUtFiiewiMZyZm6PFLWX5TIBNzGOg-LWK238/gviz/tq?tqx=out:csv";

    try {
        // ১. Packages, Users এবং Orders শিট থেকে ডাটা আনা (নাম দিয়ে)
        const [pkgRes, userRes, orderRes] = await Promise.all([
            fetch(`${BASE}&sheet=Packages`),
            fetch(`${BASE}&sheet=Users`),
            fetch(`${BASE}&sheet=Orders`)
        ]);

        const packages = csvToJSON(await pkgRes.text());
        const users = csvToJSON(await userRes.text());
        const orders = csvToJSON(await orderRes.text());

        let latestCoins = 0;
        let joinedIds = [];

        if (gameId && gameId !== 'null') {
            const user = users.find(u => u.Game_ID == gameId);
            latestCoins = user ? user.Coins : 0;
            joinedIds = orders.filter(o => o.Game_ID == gameId).map(o => o.Match_ID || o.Package);
        }

        return res.status(200).json({
            packages: packages,
            coins: latestCoins,
            joinedPackages: joinedIds
        });
    } catch (e) {
        return res.status(500).json({ error: "Data load failed" });
    }
}

// কমন ফাংশন: CSV কে ডাটাবেস ফরমেটে রূপান্তর
function csvToJSON(csv) {
    const lines = csv.split(/\r?\n/);
    if (lines.length === 0) return [];
    const headers = lines[0].split(',').map(h => h.replace(/\"/g, "").trim());
    return lines.slice(1).map(line => {
        const data = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        let obj = {};
        headers.forEach((h, i) => {
            let val = data[i] ? data[i].replace(/\"/g, "").trim() : "";
            obj[h] = val;
        });
        return obj;
    }).filter(o => o.Game_ID || o.Title || o.Match_ID);
            }
    
