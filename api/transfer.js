export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send();

    const { senderId, receiverId, amount } = req.body;
    const SHEETDB_URL = "https://sheetdb.io/api/v1/kn4x6d50pr5dm";

    try {
        // ১. প্রেরকের তথ্য ও ব্যালেন্স চেক
        const senderRes = await fetch(`${SHEETDB_URL}/search?Game_ID=${senderId}`);
        const senderData = await senderRes.json();

        if (senderData.length === 0) return res.status(404).json({ message: "আপনার আইডি পাওয়া যায়নি!" });
        
        const senderCurrentCoins = parseInt(senderData[0].Coins);
        if (senderCurrentCoins < amount) return res.status(400).json({ message: "পর্যাপ্ত কয়েন নেই!" });

        // ২. প্রাপকের আইডি চেক
        const receiverRes = await fetch(`${SHEETDB_URL}/search?Game_ID=${receiverId}`);
        const receiverData = await receiverRes.json();

        if (receiverData.length === 0) return res.status(404).json({ message: "প্রাপকের আইডি সঠিক নয়!" });

        const receiverCurrentCoins = parseInt(receiverData[0].Coins);

        // ৩. লেনদেন সম্পন্ন করা (Patch Requests)
        await fetch(`${SHEETDB_URL}/Game_ID/${senderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "Coins": senderCurrentCoins - amount })
        });

        await fetch(`${SHEETDB_URL}/Game_ID/${receiverId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "Coins": receiverCurrentCoins + amount })
        });

        const bdTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });

        // --- ৪. অটোমেটিক ইনবক্স মেসেজ (Double Notification) ---

        // (A) প্রাপকের জন্য মেসেজ
        const msgToReceiver = {
            "Game_ID": receiverId,
            "Message": `আপনি ${senderId} এর কাছ থেকে ${amount} কয়েন পেয়েছেন। ✅`,
            "Time": bdTime,
            "Is_Read": "Unseen"
        };

        // (B) প্রেরকের জন্য মেসেজ
        const msgToSender = {
            "Game_ID": senderId,
            "Message": `আপনি সফলভাবে ${receiverId} কে ${amount} কয়েন পাঠিয়েছেন। 📤`,
            "Time": bdTime,
            "Is_Read": "Unseen"
        };

        // ডাটাবেসে নোটিফিকেশন সেভ করা
        await fetch(`${SHEETDB_URL}?sheet=Notifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([msgToReceiver, msgToSender]) // একসাথে দুটি মেসেজ পাঠানো হচ্ছে
        });

        return res.status(200).json({ message: "কয়েন সফলভাবে ট্রান্সফার হয়েছে! ✅" });

    } catch (error) {
        return res.status(500).json({ message: "সার্ভারে সমস্যা হয়েছে!" });
    }
}
  
