let activeSessions = new Map();

export default async function handler(req, res) {
    const SHEETDB_URL = "https://sheetdb.io/api/v1/kn4x6d50pr5dm";
    const { action, gameId, betAmount, cellIndex, userName, isFree } = req.body;
    const bdTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });

    // ১. গেম শুরু (START) - লগইন চেক ও টাকা কাটা
    if (action === 'start') {
        try {
            // ইউজারের লগইন স্ট্যাটাস ও ব্যালেন্স চেক
            const userRes = await fetch(`${SHEETDB_URL}/search?sheet=Users&Game_ID=${gameId}`);
            const users = await userRes.json();
            
            if (users.length === 0) return res.status(401).json({ message: "Login Expired! Please login again." });

            if (!isFree) {
                const currentBalance = parseInt(users[0].Coins || 0);
                const bet = parseFloat(betAmount);
                if (currentBalance < bet) return res.status(400).json({ message: "পর্যাপ্ত ব্যালেন্স নেই!" });

                // গেমের ভেতর থেকে টাকা কেটে নেওয়া
                await fetch(`${SHEETDB_URL}/Game_ID/${gameId}?sheet=Users`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ "Coins": currentBalance - bet })
                });
            }

            // সার্ভারে গেম সেশন লক করা
            const bombLocation = Math.floor(Math.random() * 25);
            activeSessions.set(gameId, {
                bombLocation,
                betAmount: isFree ? 0 : parseFloat(betAmount),
                revealedCells: [],
                isFree: isFree === true,
                userName: userName
            });

            return res.status(200).json({ success: true });
        } catch (err) { return res.status(500).json({ message: "Server Error!" }); }
    }

    // ২. মুভ চেক (MOVE) - প্রফিট ক্যালকুলেশন
    if (action === 'move') {
        const session = activeSessions.get(gameId);
        if (!session) return res.status(400).json({ message: "Session Expired!" });

        if (cellIndex === session.bombLocation) {
            activeSessions.delete(gameId); // হারলে সেশন ডিলিট
            return res.status(200).json({ status: 'boom', bomb: session.bombLocation });
        } else {
            if (!session.revealedCells.includes(cellIndex)) {
                session.revealedCells.push(cellIndex);
            }

            let currentWin;
            if (session.isFree) {
                currentWin = session.revealedCells.length; // ফ্রি মোডে প্রতি বক্সে ১টি IQ Coin
            } else {
                // পেইড মোডে প্রতি বক্সে বেটের ১০ ভাগের ১ ভাগ (১০%) লাভ
                const profitPerBox = session.betAmount / 10;
                currentWin = session.betAmount + (profitPerBox * session.revealedCells.length);
            }

            if (session.revealedCells.length === 24) {
                return res.status(200).json({ status: 'winAll', currentWin: currentWin.toFixed(2) });
            }
            return res.status(200).json({ status: 'safe', currentWin: currentWin.toFixed(2) });
        }
    }

    // ৩. ক্যাশ আউট (FINISH) - একাউন্টে টাকা পাঠানো
    if (action === 'finish') {
        const session = activeSessions.get(gameId);
        if (!session) return res.status(400).json({ message: "No active game!" });

        try {
            let winAmount = 0;
            let updatePayload = {};
            const userRes = await fetch(`${SHEETDB_URL}/search?sheet=Users&Game_ID=${gameId}`);
            const users = await userRes.json();

            if (!session.isFree) {
                const profitPerBox = session.betAmount / 10;
                winAmount = session.betAmount + (profitPerBox * session.revealedCells.length);
                updatePayload = { "Coins": parseInt(users[0].Coins || 0) + Math.floor(winAmount) };
            } else {
                winAmount = session.revealedCells.length;
                updatePayload = { "IQ_Balance": parseInt(users[0].IQ_Balance || 0) + winAmount };
            }

            // ডাটাবেস আপডেট এবং নোটিফিকেশন
            await Promise.all([
                fetch(`${SHEETDB_URL}/Game_ID/${gameId}?sheet=Users`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatePayload)
                }),
                fetch(`${SHEETDB_URL}?sheet=Notifications`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        "Game_ID": gameId,
                        "Message": `গেম ফলাফল: আপনি ${winAmount} ${session.isFree ? 'IQ Coins' : 'Coins'} জিতেছেন। 🪙`,
                        "Time": bdTime, "Is_Read": "Unseen"
                    })
                })
            ]);

            activeSessions.delete(gameId);
            return res.status(200).json({ success: true, win: winAmount });
        } catch (err) { return res.status(500).json({ message: "Update Failed!" }); }
    }
                    }
                                            
