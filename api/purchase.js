export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send();

    const { gameId, fee, packageName, userName, matchId } = req.body;
    const SHEETDB_URL = "https://sheetdb.io/api/v1/kn4x6d50pr5dm"; // আপনার আগের URL

    if (!gameId || !fee || !matchId) {
        return res.status(400).json({ message: "প্রয়োজনীয় তথ্য পাওয়া যায়নি!" });
    }

    try {
        // ১. আগে জয়েন করেছে কি না এবং বর্তমানে কতজন জয়েন আছে তা চেক
        const [orderCheckRes, packageRes] = await Promise.all([
            fetch(`${SHEETDB_URL}/search?sheet=Orders&Game_ID=${gameId}&Match_ID=${matchId}`),
            fetch(`${SHEETDB_URL}/search?sheet=Packages&Match_ID=${matchId}`)
        ]);

        const existingOrders = await orderCheckRes.json();
        const packages = await packageRes.json();

        if (existingOrders.length > 0) {
            return res.status(400).json({ message: "আপনি ইতিমধ্যে জয়েন করেছেন! ✅" });
        }

        if (packages.length === 0) {
            return res.status(404).json({ message: "ম্যাচ পাওয়া যায়নি!" });
        }

        // ২. ইউজার ব্যালেন্স চেক
        const userRes = await fetch(`${SHEETDB_URL}/search?sheet=Users&Game_ID=${gameId}`);
        const users = await userRes.json();
        
        if (users.length === 0) {
            return res.status(404).json({ message: "ইউজার পাওয়া যায়নি!" });
        }

        const user = users[0];
        const currentCoins = parseInt(user.Coins);

        if (currentCoins < fee) {
            return res.status(400).json({ message: "আপনার পর্যাপ্ত কয়েন নেই! ❌" });
        }

        // ৩. ব্যালেন্স এবং জয়েন সংখ্যা আপডেট (PATCH ব্যবহার করে)
        const newBalance = currentCoins - fee;
        const currentJoined = parseInt(packages[0].Joined_Players || 0);
        const newJoinedCount = currentJoined + 1;

        // ব্যালেন্স আপডেট
        const updateBalance = fetch(`${SHEETDB_URL}/Game_ID/${gameId}?sheet=Users`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "Coins": newBalance })
        });

        // জয়েন প্লেয়ার সংখ্যা আপডেট (নতুন লজিক)
        const updateJoinedCount = fetch(`${SHEETDB_URL}/Match_ID/${matchId}?sheet=Packages`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "Joined_Players": newJoinedCount })
        });

        const updateRes = await Promise.all([updateBalance, updateJoinedCount]);

        if (updateRes[0].ok && updateRes[1].ok) {
            const bdTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });

            // ৪. অর্ডার লিস্টে এন্ট্রি
            await fetch(`${SHEETDB_URL}?sheet=Orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "User_Name": userName,
                    "Game_ID": gameId,
                    "Package": packageName,
                    "Match_ID": matchId,
                    "Time": bdTime,
                    "Status": "Success"
                })
            });

            // ৫. ইনবক্সে মেসেজ পাঠানো
            await fetch(`${SHEETDB_URL}?sheet=Notifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "Game_ID": gameId,
                    "Message": `অভিনন্দন! আপনি সফলভাবে "${packageName}" এ জয়েন করেছেন।`,
                    "Time": bdTime,
                    "Is_Read": "Unseen"
                })
            });

            return res.status(200).json({ success: true, newBalance: newBalance });
        } else {
            throw new Error("Update Failed");
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "সার্ভার সমস্যা! আবার চেষ্টা করুন।" });
    }
                                        }
                                                     
