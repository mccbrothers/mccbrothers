export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send();

    const { oldMatchId } = req.body;
    const SHEET_URL = "https://sheetdb.io/api/v1/ey67387uzrxk5";

    if (!oldMatchId) {
        return res.status(400).json({ message: "Match ID প্রয়োজন!" });
    }

    try {
        // ১. ওই নির্দিষ্ট ম্যাচ আইডির পুরো ডাটা শীট থেকে টেনে আনা (Search API)
        const searchRes = await fetch(`${SHEET_URL}/search?sheet=Packages&Match_ID=${oldMatchId}`);
        const packages = await searchRes.json();

        if (packages.length === 0) {
            return res.status(404).json({ message: "আগের ম্যাচের ডাটা পাওয়া যায়নি!" });
        }

        const oldMatch = packages[0]; // ফুল হওয়া ম্যাচটির সব তথ্য

        // ২. টাইম ক্যালকুলেশন (আগের টাইম থেকে ৩০ মিনিট যোগ)
        let timeDate = new Date(oldMatch.Time);
        if (isNaN(timeDate.getTime())) {
            // যদি ফরম্যাট ইস্যু থাকে, তবে বর্তমান সময় থেকে ৩০ মিনিট যোগ হবে
            timeDate = new Date();
        }
        timeDate.setMinutes(timeDate.getMinutes() + 30);
        
        // আপনার শীটের টাইম ফরম্যাট অনুযায়ী সেট করুন (যেমন: 11:30 PM)
        const newTimeStr = timeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // ৩. নতুন ম্যাচ আইডি (আগের ম্যাচ আইডি + ১)
        const newMatchId = parseInt(oldMatch.Match_ID) + 1;

        // ৪. SheetDB-তে নতুন রো পাঠানো (আগের সব ডাটা হুবহু রেখে শুধু টাইম ও আইডি পরিবর্তন)
        const response = await fetch(`${SHEET_URL}?sheet=Packages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "Title": oldMatch.Title,
                "Fee": oldMatch.Fee,
                "Map": oldMatch.Map,
                "Time": newTimeStr,
                "Prize_Pool": oldMatch.Prize_Pool,
                "Rules": oldMatch.Rules,
                "Match_ID": newMatchId,
                "Total_Slots": oldMatch.Total_Slots,
                "Joined_Players": 0 // নতুন ম্যাচে জয়েন সংখ্যা ০ থাকবে
            })
        });

        if (response.ok) {
            return res.status(200).json({ 
                success: true, 
                message: " নতুন ম্যাচ তৈরি হয়েছে! জয়েন করুন",
                newMatchId: newMatchId 
            });
        } else {
            throw new Error("SheetDB-তে ডাটা পাঠাতে সমস্যা হয়েছে");
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "সার্ভার এরর! ডাটা টেনে আনা সম্ভব হয়নি।" });
    }
    }
  
