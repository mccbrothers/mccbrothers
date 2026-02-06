export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).send();

    const { gameId } = req.query;
    // আপনার দেওয়া গুগল শিট লিঙ্ক (CSV Export Format)
    const SHEET_URL = "https://docs.google.com/spreadsheets/d/1l_P0T1okUtFiiewiMZyZm6PFLWX5TIBNzGOg-LWK238/gviz/tq?tqx=out:csv";

    try {
        // ১. সরাসরি শিট থেকে ৩টি ট্যাবের ডাটা ফেচ করা (প্যাকেজ, ইউজার, অর্ডার)
        const [pkgRes, userRes, orderRes] = await Promise.all([
            fetch(`${SHEET_URL}&sheet=Packages`),
            fetch(`${SHEET_URL}&sheet=Users`),
            fetch(`${SHEET_URL}&sheet=Orders`)
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

        // আপনার আগের ফরমেটেই ডাটা ফেরত পাঠানো হচ্ছে
        return res.status(200).json({
            packages: packages,
            coins: latestCoins,
            joinedPackages: joinedIds
        });

    } catch (error) {
        return res.status(500).json({ error: "Server Error" });
    }
}

// CSV কে JSON বানানোর প্রসেসর (এটি এপিআই ফোল্ডারে গোপন থাকবে)
function csvToJSON(csv) {
    const lines = csv.split(/\r?\n/);
    const headers = lines[0].split(',').map(h => h.replace(/\"/g, "").trim());
    return lines.slice(1).map(line => {
        const data = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        let obj = {};
        headers.forEach((h, i) => {
            obj[h] = data[i] ? data[i].replace(/\"/g, "").trim() : "";
        });
        return obj;
    });
            }
