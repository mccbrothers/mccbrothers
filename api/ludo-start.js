export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send();

    const { gameId, fee } = req.body;
    const SHEETDB_URL = "https://sheetdb.io/api/v1/mnfytfv1quzk0";

    try {
        // ১. প্রথমে ইউজারের বর্তমান কয়েন চেক করা
        const userRes = await fetch(`${SHEETDB_URL}/search?Game_ID=${gameId}`);
        const userData = await userRes.json();

        if (userData.length === 0) {
            return res.status(404).json({ message: "ইউজার পাওয়া যায়নি!" });
        }

        const currentUser = userData[0];
        const currentCoins = parseInt(currentUser.Coins);

        // ২. চেক করা পর্যাপ্ত কয়েন আছে কি না
        if (currentCoins < fee) {
            return res.status(400).json({ message: "আপনার পর্যাপ্ত কয়েন নেই! 🪙" });
        }

        // ৩. কয়েন কেটে নেওয়া (SheetDB Update)
        const newCoins = currentCoins - fee;
        const updateRes = await fetch(`${SHEETDB_URL}/Game_ID/${gameId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: { "Coins": newCoins }
            })
        });

        if (updateRes.ok) {
            return res.status(200).json({ 
                success: true, 
                message: "Entry fee deducted", 
                remainingCoins: newCoins 
            });
        } else {
            throw new Error("Update failed");
        }

    } catch (error) {
        console.error("Ludo Start Error:", error);
        return res.status(500).json({ message: "সার্ভারে সমস্যা হয়েছে!" });
    }
              }
      
