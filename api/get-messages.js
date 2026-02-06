export default async function handler(req, res) {
    const { gameId } = req.query;
    const NOTIFY_CSV_URL = "https://docs.google.com/spreadsheets/d/1l_P0T1okUtFiiewiMZyZm6PFLWX5TIBNzGOg-LWK238/export?format=csv&gid=1114291772"; // Notifications gid

    try {
        const response = await fetch(NOTIFY_CSV_URL);
        const csvText = await response.text();
        const allMessages = csvToJSON(csvText);
        
        const userMessages = allMessages.filter(m => m.Game_ID == gameId);
        return res.status(200).json(userMessages);
    } catch (error) {
        return res.status(500).json({ error: "মেসেজ লোড করা যাচ্ছে না" });
    }
}
function csvToJSON(csv) { /* একই ফাংশন */ }
