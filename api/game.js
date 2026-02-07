export default async function handler(req, res) {
    const SHEETDB_URL = "https://sheetdb.io/api/v1/mnfytfv1quzk0";
    
    // ১. গেম শুরু (Betting Logic)
    if (req.method === 'POST') {
        const { gameId, betAmount, userName } = req.body;

        if (!gameId || betAmount < 5) {
            return res.status(400).json({ message: "সর্বনিম্ন ৫ টাকা বাজি ধরতে হবে!" });
        }

        try {
            // ইউজার ব্যালেন্স চেক
            const userRes = await fetch(`${SHEETDB_URL}/search?sheet=Users&Game_ID=${gameId}`);
            const users = await userRes.json();

            if (users.length === 0 || parseInt(users[0].Coins) < betAmount) {
                return res.status(400).json({ message: "পর্যাপ্ত ব্যালেন্স নেই!" });
            }

            const newBalance = parseInt(users[0].Coins) - parseInt(betAmount);
            
            // টাকা কাটা
            await fetch(`${SHEETDB_URL}/Game_ID/${gameId}?sheet=Users`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ "Coins": newBalance })
            });

            // সার্ভার সাইডে বোমার অবস্থান তৈরি (০-২৪)
            const bombLocation = Math.floor(Math.random() * 25);

            return res.status(200).json({ 
                success: true, 
                newBalance, 
                bombLocation // এখানে টোকেন বা এনক্রিপশন ব্যবহার করা শ্রেয়, আপাতত সিম্পল রাখা হলো
            });

        } catch (error) {
            return res.status(500).json({ message: "সার্ভার সমস্যা!" });
        }
    }
              }
