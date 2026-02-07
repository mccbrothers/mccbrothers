export default async function handler(req, res) {
    const SHEETDB_URL = "https://sheetdb.io/api/v1/mnfytfv1quzk0";
    const { gameId, amount, status, bet, userName } = req.body;
    const bdTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });

    try {
        // ১. ব্যালেন্স আপডেট (যদি জিতে যায়)
        if (amount > 0) {
            const userRes = await fetch(`${SHEETDB_URL}/search?sheet=Users&Game_ID=${gameId}`);
            const users = await userRes.json();
            const newTotal = parseInt(users[0].Coins) + Math.floor(amount);

            await fetch(`${SHEETDB_URL}/Game_ID/${gameId}?sheet=Users`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ "Coins": newTotal })
            });
        }

        // ২. গেম লগ এবং ইনবক্স মেসেজ (একসাথে রাইট)
        await Promise.all([
            fetch(`${SHEETDB_URL}?sheet=Game_Logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Game_ID: gameId, User_Name: userName, Bet_Amount: bet, Result: amount > 0 ? 'Win' : 'Loss', Final_Amount: amount, Status: status, Time: bdTime })
            }),
            fetch(`${SHEETDB_URL}?sheet=Notifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Game_ID: gameId, Message: `গেম রেজাল্ট: আপনি ${amount > 0 ? amount+' ৳ জিতেছেন' : 'হেরেছেন'}।`, Time: bdTime, Is_Read: "Unseen" })
            })
        ]);

        return res.status(200).json({ success: true });
    } catch (e) { return res.status(500).json({ error: e.message }); }
              }
          
