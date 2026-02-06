export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).send();

    const { gameId } = req.query;
    const SHEET_URL = "https://sheetdb.io/api/v1/ey67387uzrxk5";

    if (!gameId) {
        return res.status(400).json({ error: "Game ID missing" });
    }

    try {
        // ১. 'Packages' শীট থেকে সব টুর্নামেন্ট ডাটা আনা
        const pkgResponse = await fetch(`${SHEET_URL}?sheet=Packages`);
        const packages = await pkgResponse.json();

        // ২. 'Users' শীট থেকে ইউজারের লেটেস্ট কয়েন ব্যালেন্স আনা
        const userResponse = await fetch(`${SHEET_URL}/search?Game_ID=${gameId}`);
        const userData = await userResponse.json();
        const latestCoins = userData.length > 0 ? userData[0].Coins : 0;

        // ৩. 'Orders' শীট থেকে চেক করা ইউজার কোন কোন ম্যাচে জয়েন করেছে
        const orderResponse = await fetch(`${SHEET_URL}/search?sheet=Orders&Game_ID=${gameId}`);
        const orders = await orderResponse.json();
        
        // এখানে Match_ID এবং Package Name দুইটাই নেওয়া হচ্ছে নিরাপত্তার জন্য
        const joinedIds = orders.map(order => order.Match_ID || order.Package);

        // সব তথ্য একসাথে ফ্রন্টএন্ডে পাঠানো
        return res.status(200).json({
            packages: packages,         // এখানে Title, Time, Match_ID সব থাকবে
            coins: latestCoins,         
            joinedPackages: joinedIds   // এটি দিয়ে home.html বাটন 'Applied' দেখাবে
        });

    } catch (error) {
        console.error("Fetch Error:", error);
        return res.status(500).json({ error: "ডাটা লোড করতে সমস্যা হয়েছে" });
    }
}
