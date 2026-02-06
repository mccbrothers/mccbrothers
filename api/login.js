export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send();
    const { gameId, pin } = req.body;
    const USERS_CSV_URL = "https://docs.google.com/spreadsheets/d/1l_P0T1okUtFiiewiMZyZm6PFLWX5TIBNzGOg-LWK238/export?format=csv&gid=0";

    try {
        const response = await fetch(USERS_CSV_URL);
        const csvText = await response.text();
        const users = csvToJSON(csvText);

        const user = users.find(u => u.Game_ID == gameId);

        if (!user) return res.status(401).json({ message: "ইউজার পাওয়া যায়নি!" });

        if (user.PIN == pin) {
            return res.status(200).json({
                message: "Success",
                user: { name: user.Name, gameId: user.Game_ID, coins: user.Coins }
            });
        } else {
            return res.status(401).json({ message: "ভুল পিন নম্বর!" });
        }
    } catch (error) {
        return res.status(500).json({ message: "লগইন সিস্টেম এই মুহূর্তে বন্ধ আছে" });
    }
}

// CSV Parser ফাংশন (আগেরটার মতো)
function csvToJSON(csv) {
    const lines = csv.split("\n");
    const headers = lines[0].split(",");
    return lines.slice(1).map(line => {
        const data = line.split(",");
        let obj = {};
        headers.forEach((h, i) => obj[h.trim()] = data[i]?.trim());
        return obj;
    });
}
