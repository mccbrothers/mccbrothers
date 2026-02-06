export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).send();

    const { gameId } = req.query;
    const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1l_P0T1okUtFiiewiMZyZm6PFLWX5TIBNzGOg-LWK238/export?format=csv";

    try {
        // ১. সরাসরি শিট থেকে সব ডাটা আনা (প্যাকেজ মেইন শিটে থাকে)
        const response = await fetch(SHEET_CSV_URL);
        const csvText = await response.text();
        const allPackages = csvToJSON(csvText);

        // ২. ইউজারের কয়েন এবং অর্ডার চেক করার জন্য আলাদা আলাদা শিট ডাটা আনা
        // আমরা একই ইউআরএল এর শেষে '&gid=ID' যোগ করে আলাদা ট্যাব পড়তে পারি
        // Users শিট (gid=0 বা আপনার শিটের আইডি অনুযায়ী)
        const usersRes = await fetch(`${SHEET_CSV_URL}&gid=0`); 
        const usersCsv = await usersRes.text();
        const users = csvToJSON(usersCsv);

        // Orders শিট (gid=আপনার অর্ডার শিটের আইডি)
        const ordersRes = await fetch(`${SHEET_CSV_URL}&gid=1740905391`); 
        const ordersCsv = await ordersRes.text();
        const orders = csvToJSON(ordersCsv);

        let latestCoins = 0;
        let joinedIds = [];

        if (gameId && gameId !== 'null') {
            const user = users.find(u => u.Game_ID == gameId);
            latestCoins = user ? user.Coins : 0;
            joinedIds = orders.filter(o => o.Game_ID == gameId).map(o => o.Match_ID || o.Package);
        }

        return res.status(200).json({
            packages: allPackages,
            coins: latestCoins,
            joinedPackages: joinedIds
        });

    } catch (error) {
        return res.status(500).json({ error: "Failed to load data" });
    }
}

function csvToJSON(csv) {
    const lines = csv.split("\n");
    const headers = lines[0].split(",");
    return lines.slice(1).map(line => {
        const data = line.split(",");
        let obj = {};
        headers.forEach((h, i) => obj[h.trim()] = data[i]?.trim());
        return obj;
    }).filter(o => o.Title || o.Game_ID); 
}
