export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send();

    const { gameId, promoCode } = req.body;
    const SHEETDB_URL = "https://sheetdb.io/api/v1/kn4x6d50pr5dm"; 

    try {
        // ১. প্রোমো কোডটি সঠিক এবং একটিভ কিনা চেক করা
        const codeRes = await fetch(`${SHEETDB_URL}/search?sheet=PromoCodes&Code=${promoCode}&Status=Active`);
        const codes = await codeRes.json();

        if (codes.length === 0) {
            return res.status(400).json({ message: "ভুল বা ব্যবহৃত কোড! ❌" });
        }

        const prizeAmount = parseInt(codes[0].Amount);

        // ২. ইউজারের তথ্য বের করা
        const userRes = await fetch(`${SHEETDB_URL}/search?sheet=Users&Game_ID=${gameId}`);
        const users = await userRes.json();

        if (users.length === 0) {
            return res.status(404).json({ message: "ইউজার ডাটা পাওয়া যায়নি!" });
        }

        const oldCoins = parseInt(users[0].Coins || 0);
        const newBalance = oldCoins + prizeAmount;
        const bdTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });

        // ৩. তিনটি কাজ একসাথে করা: ব্যালেন্স আপডেট, কোড ব্যবহৃত করা এবং ইনবক্সে মেসেজ
        await Promise.all([
            // ইউজারের ব্যালেন্স আপডেট
            fetch(`${SHEETDB_URL}/Game_ID/${gameId}?sheet=Users`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ "Coins": newBalance })
            }),
            // কোডটিকে 'Used' করা যাতে আর কেউ ব্যবহার না করতে পারে
            fetch(`${SHEETDB_URL}/Code/${promoCode}?sheet=PromoCodes`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ "Status": "Used" })
            }),
            // ইনবক্সে মেসেজ পাঠানো
            fetch(`${SHEETDB_URL}?sheet=Notifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "Game_ID": gameId,
                    "Message": `অভিনন্দন! আপনি সফলভাবে ${prizeAmount} কয়েন রিডিম করেছেন।`,
                    "Time": bdTime,
                    "Is_Read": "Unseen"
                })
            })
        ]);

        return res.status(200).json({ message: `সাফল্য! ${prizeAmount} কয়েন যোগ করা হয়েছে। ✅` });

    } catch (error) {
        return res.status(500).json({ message: "সার্ভার এরর! পরে চেষ্টা করুন।" });
    }
}
  
