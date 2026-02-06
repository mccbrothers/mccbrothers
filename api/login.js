export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send();

    const { gameId, pin } = req.body;
    const SHEETDB_URL = "https://sheetdb.io/api/v1/kn4x6d50pr5dm";

    try {
        // ১. সরাসরি Game_ID দিয়ে সার্চ করা
        const response = await fetch(`${SHEETDB_URL}/search?Game_ID=${gameId}`);
        const users = await response.json();

        if (users.length === 0) {
            return res.status(401).json({ message: "ইউজার পাওয়া যায়নি!" });
        }

        const user = users[0];

        // ২. পিন চেক করা (আপনার শীটে PIN কলাম আছে)
        if (user.PIN == pin) {
            return res.status(200).json({
                message: "Success",
                user: {
                    name: user.Name,
                    gameId: user.Game_ID,
                    coins: user.Coins
                }
            });
        } else {
            return res.status(401).json({ message: "ভুল পিন নম্বর!" });
        }
    } catch (error) {
        return res.status(500).json({ message: "সার্ভারে সমস্যা হয়েছে!" });
    }
}
