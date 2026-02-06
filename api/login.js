export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send();
    const { gameId, pin } = req.body;
    const USERS_URL = "https://docs.google.com/spreadsheets/d/1l_P0T1okUtFiiewiMZyZm6PFLWX5TIBNzGOg-LWK238/gviz/tq?tqx=out:csv&sheet=Users";

    try {
        const response = await fetch(USERS_URL);
        const users = csvToJSON(await response.text());
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
        return res.status(500).json({ message: "লগইন এই মুহূর্তে কাজ করছে না" });
    }
}
function csvToJSON(csv) { /* উপরে দেওয়া একই ফাংশনটি এখানে কপি করুন */ }
