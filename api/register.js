export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send();

    const { name, gameId, pin } = req.body;
    const SHEETDB_URL = "https://sheetdb.io/api/v1/kn4x6d50pr5dm";

    try {
        // ১. চেক করা: এই Game ID দিয়ে আগে থেকেই একাউন্ট আছে কি না
        const checkRes = await fetch(`${SHEETDB_URL}/search?Game_ID=${gameId}`);
        const existingUsers = await checkRes.json();

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: "এই Game ID দিয়ে ইতিমধ্যে একাউন্ট খোলা হয়েছে!" });
        }

        // ২. নতুন ইউজার ডাটা তৈরি (আপনার শীটের কলাম অনুযায়ী)
        const newUser = {
            "Name": name,
            "Game_ID": gameId,
            "PIN": pin,
            "Coins": 0,          // নতুন ইউজারের ব্যালেন্স ০
            "Referral_By": "",   // আপাতত খালি
            "Total_Referrals": 0
        };

        // ৩. SheetDB-তে ডাটা পাঠানো
        const registerRes = await fetch(SHEETDB_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });

        if (registerRes.ok) {
            // ৪. নতুন ইউজারকে একটি ওয়েলকাম মেসেজ পাঠানো (Notifications Sheet)
            await fetch(`${SHEETDB_URL}?sheet=Notifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "Game_ID": gameId,
                    "Message": `Elite Nexus-এ আপনাকে স্বাগতম, ${name}! টুর্নামেন্টে যোগ দিতে কয়েন কিনুন।`,
                    "Time": new Date().toLocaleString(),
                    "Is_Read": "Unseen"
                })
            });

            return res.status(200).json({ message: "Registration Successful" });
        } else {
            throw new Error("SheetDB Error");
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "সার্ভারে সমস্যা হয়েছে। পরে চেষ্টা করুন।" });
    }
            }
      
