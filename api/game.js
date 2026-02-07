let activeSessions = new Map();

export default async function handler(req, res) {
    const SHEETDB_URL = "https://sheetdb.io/api/v1/kn4x6d50pr5dm";
    const { action, gameId, packageName, cellIndex, userName, paymentType } = req.body;
    const bdTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });

    // প্যাকেজ কনফিগুরেশন (আপনার দেওয়া শর্ত অনুযায়ী)
    const packages = {
            // ফি ৫ IQ, লাভ প্রতি বক্সে ১ IQ
        '5tk': { fee: 5, profit: 0.5 },   // ফি ৫ টাকা, লাভ ০.৫ টাকা
        '10tk': { fee: 10, profit: 1 },   // ফি ১০ টাকা, লাভ ১ টাকা
        '50tk': { fee: 50, profit: 5 },   // ফি ৫০ টাকা, লাভ ৫ টাকা
        '100tk': { fee: 100, profit: 10 } // ফি ১০০ টাকা, লাভ ১০ টাকা
    };

    if (action === 'start') {
        try {
            const pkg = packages[packageName];
            if (!pkg) return res.status(400).json({ message: "প্যাকেজটি সঠিক নয়!" });

            // ১. ইউজার ডাটা চেক (নিরাপত্তা)
            const userRes = await fetch(`${SHEETDB_URL}/search?sheet=Users&Game_ID=${gameId}`);
            const users = await userRes.json();
            if (users.length === 0) return res.status(401).json({ message: "লগইন নেই!" });

            // ২. ব্যালেন্স চেক (রিয়েল কয়েন নাকি IQ)
            const targetCol = (paymentType === 'IQ' || packageName === 'Free') ? 'IQ_Balance' : 'Coins';
            const currentBalance = parseInt(users[0][targetCol] || 0);

            if (currentBalance < pkg.fee) {
                return res.status(400).json({ message: `আপনার ${targetCol}-এ পর্যাপ্ত ব্যালেন্স নেই!` });
            }

            // ৩. ফি কেটে নেওয়া (গেমের শুরুতেই)
            await fetch(`${SHEETDB_URL}/Game_ID/${gameId}?sheet=Users`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [targetCol]: currentBalance - pkg.fee })
            });

            // ৪. সার্ভারে সেশন লক করা
            const bombLocation = Math.floor(Math.random() * 25);
            activeSessions.set(gameId, {
                bombLocation,
                fee: pkg.fee,
                profitPerBox: pkg.profit,
                revealedCells: [],
                paymentType: targetCol,
                userName: userName
            });

            return res.status(200).json({ success: true });
        } catch (err) { return res.status(500).json({ message: "সার্ভার এরর!" }); }
    }

    if (action === 'move') {
        const session = activeSessions.get(gameId);
        if (!session) return res.status(400).json({ message: "সেশন খুঁজে পাওয়া যায়নি!" });

        if (cellIndex === session.bombLocation) {
            const loss = session.fee;
            activeSessions.delete(gameId);
            return res.status(200).json({ 
                status: 'boom', 
                bomb: session.bombLocation,
                msg: `ব্লাস্ট! আপনি ${loss} ${session.paymentType} হারিয়েছেন।` 
            });
        } else {
            if (!session.revealedCells.includes(cellIndex)) {
                session.revealedCells.push(cellIndex);
            }
            const profit = session.profitPerBox * session.revealedCells.length;
            return res.status(200).json({ status: 'safe', currentWin: profit.toFixed(2) });
        }
    }

    if (action === 'finish') {
        const session = activeSessions.get(gameId);
        if (!session) return res.status(400).json({ message: "সেশন শেষ!" });

        try {
            const profit = session.profitPerBox * session.revealedCells.length;
            const totalWin = session.fee + profit; // মূল বেট + লাভ ফেরত
            
            const userRes = await fetch(`${SHEETDB_URL}/search?sheet=Users&Game_ID=${gameId}`);
            const users = await userRes.json();
            
            const newTotal = parseInt(users[0][session.paymentType] || 0) + Math.floor(totalWin);

            await Promise.all([
                fetch(`${SHEETDB_URL}/Game_ID/${gameId}?sheet=Users`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ [session.paymentType]: newTotal })
                }),
                fetch(`${SHEETDB_URL}?sheet=Notifications`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        "Game_ID": gameId,
                        "Message": `গেম জয়: ${totalWin} ${session.paymentType} যোগ হয়েছে।`,
                        "Time": bdTime, "Is_Read": "Unseen"
                    })
                })
            ]);

            activeSessions.delete(gameId);
            return res.status(200).json({ success: true, win: totalWin, msg: `আপনি ${totalWin} টাকা জিতেছেন!` });
        } catch (err) { return res.status(500).json({ message: "আপডেট এরর!" }); }
    }
}
