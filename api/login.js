export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send();

    const { gameId, pin } = req.body;
    // আপনার গুগল শিটের ডাইরেক্ট CSV লিঙ্ক (GID ছাড়া ট্যাব নাম দিয়ে)
    const USERS_SHEET_URL = "https://docs.google.com/spreadsheets/d/1l_P0T1okUtFiiewiMZyZm6PFLWX5TIBNzGOg-LWK238/gviz/tq?tqx=out:csv&sheet=Users";

    try {
        // ১. সরাসরি Users ট্যাব থেকে ডাটা আনা
        const response = await fetch(USERS_SHEET_URL);
        const csvData = await response.text();
        const users = csvToJSON(csvData);

        // ২. আপনার আগের লজিক: Game_ID দিয়ে ইউজার খুঁজে বের করা
        const user = users.find(u => u.Game_ID == gameId);

        if (!user) {
            return res.status(401).json({ message: "ইউজার পাওয়া যায়নি!" });
        }

        // ৩. আপনার আগের লজিক: পিন চেক করা
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
        console.error(error);
        return res.status(500).json({ message: "সার্ভারে সমস্যা হয়েছে!" });
    }
}

// এই ফাংশনটি CSV ডাটাকে আপনার আগের JSON ফরম্যাটে বদলে দেবে
function csvToJSON(csv) {
    const lines = csv.split(/\r?\n/);
    const headers = lines[0].split(',').map(h => h.replace(/\"/g, "").trim());
    return lines.slice(1).map(line => {
        const data = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        let obj = {};
        headers.forEach((h, i) => {
            obj[h] = data[i] ? data[i].replace(/\"/g, "").trim() : "";
        });
        return obj;
    });
}
