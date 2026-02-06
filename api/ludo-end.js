export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send();

    const { gameId, reward, secretToken } = req.body;
    const SHEETDB_URL = "https://sheetdb.io/api/v1/mnfytfv1quzk0";

    // সিকিউরিটি চেক: হ্যাকাররা যাতে সরাসরি এই এপিআই কল করতে না পারে
    if (secretToken !== "ZFOX_LUDO_VERIFIED") {
        return res.status(403).json({ message: "Invalid Request!" });
    }

    try {
        // ১. ইউজারের বর্তমান কয়েন কত আছে দেখা
        const userRes = await fetch(`${SHEETDB_URL}/search?Game_ID=${gameId}`);
        const userData = await userRes.json();
        
        if (userData.length === 0) return res.status(404).json({ message: "User not found" });

        const currentCoins = parseInt(userData[0].Coins);
        const updatedCoins = currentCoins + parseInt(reward);

        // ২. কয়েন বাড়িয়ে আপডেট করা
        const updateRes = await fetch(`${SHEETDB_URL}/Game_ID/${gameId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: { "Coins": updatedCoins }
            })
        });

        if (updateRes.ok) {
            return res.status(200).json({ success: true, newBalance: updatedCoins });
        } else {
            throw new Error("Reward update failed");
        }
    } catch (error) {
        return res.status(500).json({ message: "Server Error" });
    }
                                      }
