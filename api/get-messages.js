export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).send();

    const { gameId } = req.query;
    const SHEET_URL = "https://sheetdb.io/api/v1/kn4x6d50pr5dm"; // URL এখন ব্যাকএন্ডে নিরাপদ

    if (!gameId) {
        return res.status(400).json({ error: "Game ID missing" });
    }

    try {
        const response = await fetch(`${SHEET_URL}/search?sheet=Notifications&Game_ID=${gameId}`);
        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: "Server Error" });
    }
}
  
