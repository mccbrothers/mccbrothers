export default async function handler(req, res) {
    const { gameId } = req.query;
    const NOTIFY_URL = "https://docs.google.com/spreadsheets/d/1l_P0T1okUtFiiewiMZyZm6PFLWX5TIBNzGOg-LWK238/gviz/tq?tqx=out:csv&sheet=Notifications";

    try {
        const response = await fetch(NOTIFY_URL);
        const allMessages = csvToJSON(await response.text());
        const userMessages = allMessages.filter(m => m.Game_ID == gameId);
        return res.status(200).json(userMessages);
    } catch (e) {
        return res.status(500).json({ error: "মেসেজ পাওয়া যায়নি" });
    }
}
function csvToJSON(csv) { /* উপরে দেওয়া একই ফাংশনটি এখানে কপি করুন */ }
