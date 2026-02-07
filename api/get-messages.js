export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).send();

    const { gameId } = req.query;
    // আপনার গুগল শিটের লিঙ্ক (Notifications ট্যাব থেকে ডাটা আনবে)
    const NOTIFY_URL = "https://docs.google.com/spreadsheets/d/1l_P0T1okUtFiiewiMZyZm6PFLWX5TIBNzGOg-LWK238/gviz/tq?tqx=out:csv&sheet=Notifications";

    if (!gameId) {
        return res.status(400).json({ error: "Game ID missing" });
    }

    try {
        // ১. সরাসরি শিট থেকে মেসেজ ডাটা আনা
        const response = await fetch(NOTIFY_URL);
        const csvData = await response.text();
        const allMessages = csvToJSON(csvData);

        // ২. আপনার আগের লজিক: শুধুমাত্র এই gameId-র মেসেজগুলো ফিল্টার করা
        const userMessages = allMessages.filter(m => m.Game_ID == gameId);

        // ৩. রেজাল্ট ফেরত পাঠানো
        return res.status(200).json(userMessages);
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server Error" });
    }
}

// CSV কে JSON বানানোর জন্য কমন ফাংশন
function csvToJSON(csv) {
    const lines = csv.split(/\r?\n/);
    if (lines.length === 0) return [];
    const headers = lines[0].split(',').map(h => h.replace(/\"/g, "").trim());
    return lines.slice(1).map(line => {
        const data = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        let obj = {};
        headers.forEach((h, i) => {
            obj[h] = data[i] ? data[i].replace(/\"/g, "").trim() : "";
        });
        return obj;
    }).filter(o => o.Game_ID); // ফাঁকা ডাটা বাদ দেওয়ার জন্য
}
    
