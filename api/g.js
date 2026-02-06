export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).send();

    // সরাসরি গুগল শিট লিঙ্ক (CSV Export Format)
    const SHEET_URL = "https://docs.google.com/spreadsheets/d/1l_P0T1okUtFiiewiMZyZm6PFLWX5TIBNzGOg-LWK238/gviz/tq?tqx=out:csv&sheet=Packages";

    try {
        // ১. শুধুমাত্র Packages ট্যাব থেকে ডাটা ফেচ করা
        const response = await fetch(SHEET_URL);
        if (!response.ok) throw new Error("Sheet fetch failed");
        
        const csvData = await response.text();
        const packages = csvToJSON(csvData);

        // ২. গেস্টদের জন্য শুধুমাত্র প্যাকেজ লিস্ট পাঠানো হচ্ছে
        return res.status(200).json({
            packages: packages
        });

    } catch (error) {
        console.error("API Error:", error);
        return res.status(500).json({ error: "Server Error" });
    }
}

// CSV কে JSON বানানোর প্রসেসর (তোমার অন্য ফাইলের মতো হুবহু)
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
    }).filter(o => o.Title); // টাইটেল নেই এমন ফাঁকা রো বাদ দেওয়ার জন্য
                                            }
                              
