export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).send();
    const { gameId } = req.query;
    const NOTIFY_URL = "https://docs.google.com/spreadsheets/d/1l_P0T1okUtFiiewiMZyZm6PFLWX5TIBNzGOg-LWK238/gviz/tq?tqx=out:csv&sheet=Notifications";

    try {
        const response = await fetch(NOTIFY_URL);
        const allMessages = csvToJSON(await response.text());
        const userMessages = allMessages.filter(m => m.Game_ID == gameId);
        return res.status(200).json(userMessages);
    } catch (error) {
        return res.status(500).json({ error: "Server Error" });
    }
}
function csvToJSON(csv) { /* উপরে দেওয়া ফাংশনটি এখানেও ব্যবহার করুন */ }
