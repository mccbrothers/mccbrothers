document.addEventListener('DOMContentLoaded', () => {
    const loaderWrapper = document.getElementById('loader');
    const navbar = document.getElementById('navbar');
    const contentArea = document.getElementById('content-area');
    const navLinks = document.querySelector('.nav-links');
    const burger = document.querySelector('.burger');
    const footer = document.getElementById('footer');

    loaderWrapper.classList.remove('loader-hidden');

    // API URLs
    const GOOGLE_SHEETS_API_URL = 'https://sheetdb.io/api/v1/w51cfqk66hrnb'; 
    const IMAGE_API_URL = 'https://sheetdb.io/api/v1/w51cfqk66hrnb?sheet=sheet2'; 

    const pages = {
        home: `
            <section class="hero-section">
                <h1>বিদায় নয়, স্মৃতির পুনর্মিলন</h1>
                <p>ময়মনসিংহ কমার্স কলেজ | মানবিক 'i' সেকশন | ব্যাচ ২০২৫</p>
                <button class="btn" onclick="navigateTo('gallery')">স্মৃতিগুলো দেখুন</button>
            </section>
            <section class="section">
                <h2>আমাদের গল্প</h2>
                <p>স্মৃতিরা কখনো পুরনো হয় না, শুধু সময়ের ধুলোয় একটু ঢাকা পড়ে। ময়মনসিংহ কমার্স কলেজের সেই পরিচিত করিডোর, ক্লাসের পেছনের বেঞ্চের আড্ডা, আর টিফিনের ভাগাভাগি—সবই এখন ক্যালেন্ডারের পাতায় বন্দি। আমরা হয়তো এখন আর একই ক্লাসরুমে বসবো না, হয়তো ইউনিফর্মটা আলমারির এক কোণে পড়ে থাকবে, কিন্তু আমাদের বন্ধুত্ব আর এই হাজারো হাসিমুখের স্মৃতিগুলো বেঁচে থাকবে এই ডিজিটাল ঠিকানায়। আমরা প্রাক্তন হয়েছি ঠিকই, কিন্তু আমাদের গল্পগুলো চিরকাল অম্লান।</p>
                <p>এই ওয়েবসাইটটি আমাদের সেই সকল সোনালী মুহূর্তের একটি দলিল, যেখানে প্রতিটি ছবি, প্রতিটি বার্তা আমাদের ফেলে আসা দিনগুলোর কথা বলবে। আসুন, ডুব দিই স্মৃতির অতল গহ্বরে, যেখানে বন্ধুত্ব আর ভালোবাসার অনির্বাণ শিখা চিরকাল জ্বলবে।</p>
            </section>
        `,
        gallery: `
            <section class="section">
                <h2>আমাদের ঝলমলে স্মৃতি</h2>
                <p>এই গ্যালারিতে তোমাদের দেওয়া প্রতিটি ছবি আমাদের কলেজ জীবনের এক একটি মুহূর্তকে জীবন্ত করে রেখেছে।</p>
                <div id="gallery-grid" class="gallery-grid">
                    <p style="text-align: center;">ছবিগুলো লোড হচ্ছে...</p>
                </div>
            </section>
        `,
        messages: `
            <section class="section">
                <h2>স্মারক বার্তা লিখুন</h2>
                <p>তোমাদের অনুভূতি, কলেজের দিনগুলো নিয়ে মজার স্মৃতি বা বন্ধুদের জন্য কোনো বিশেষ বার্তা এখানে লিখে জানাতে পারো। তোমাদের কথাগুলো আমাদের ওয়েবসাইটে উজ্জ্বল হয়ে থাকবে।</p>
                <form id="message-form" class="message-form">
                    <input type="text" id="sender-name" placeholder="তোমার নাম (আবশ্যিক)" required>
                    <textarea id="message-text" placeholder="তোমার স্মারক বার্তা লিখো..." rows="5" required></textarea>
                    <button type="submit" class="btn message-submit-btn">বার্তা পাঠান</button>
                    <p id="form-message" style="text-align: center; margin-top: 10px;"></p>
                </form>
                <h2>বন্ধুদের স্মারক বার্তা</h2>
                <div id="messages-list">
                    <p style="text-align: center;">বার্তাগুলো লোড হচ্ছে...</p>
                </div>
            </section>
        `,
        about: `
            <section class="section">
                <h2>আমাদের কথা</h2>
                <p>আমরা ময়মনসিংহ কমার্স কলেজের মানবিক 'i' সেকশনের ২০২৫ ব্যাচের প্রাক্তন শিক্ষার্থী। এই ওয়েবসাইটটি আমাদের সবার সম্মিলিত প্রচেষ্টা এবং ভালোবাসার ফসল।</p>
                <p>ওয়েবসাইটটি তৈরি করেছে:</p>
                <ul>
                    <li>তোমার নাম ১</li>
                    <li>তোমার নাম ২</li>
                    <li>তোমার নাম ৩</li>
                    </ul>
                <p>যদি আমাদের ওয়েবসাইট বা স্মৃতি নিয়ে কোনো প্রশ্ন থাকে, তবে নির্দ্বিধায় আমাদের সাথে যোগাযোগ করতে পারো। আমাদের ইমেইল: <a href="mailto:info@mcci.com">info@mcci.com</a></p>
            </section>
        `
    };

    function loadPage(pageName) {
        if (pages[pageName]) {
            contentArea.style.opacity = 0; 
            setTimeout(() => {
                contentArea.innerHTML = pages[pageName];
                contentArea.style.opacity = 1; 

                if (pageName === 'messages') {
                    setupMessageForm();
                    fetchMessages();
                }
                
                if (pageName === 'gallery') {
                    fetchGalleryImages();
                }

                document.querySelectorAll('.nav-links a').forEach(link => {
                    link.classList.remove('active');
                });
                const activeLink = document.querySelector(`.nav-links a[data-page="${pageName}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }, 300); 
        } else {
            contentArea.innerHTML = `<section class="section"><h2>পেজটি খুঁজে পাওয়া যায়নি!</h2></section>`;
        }
    }

    // --- এই অংশটিতে সামান্য পরিবর্তন করা হয়েছে যেন HTML বাটন একে খুঁজে পায় ---
    window.navigateTo = function(pageName) {
        history.pushState({ page: pageName }, '', `#${pageName}`);
        loadPage(pageName);
        navLinks.classList.remove('nav-active');
        burger.classList.remove('toggle');
    };

    const initialPage = window.location.hash ? window.location.hash.substring(1) : 'home';
    loadPage(initialPage);

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.navigateTo(e.target.dataset.page); // window. যোগ করা হয়েছে
        });
    });

    window.addEventListener('popstate', (event) => {
        loadPage(event.state && event.state.page ? event.state.page : 'home');
    });

    burger.addEventListener('click', () => {
        navLinks.classList.toggle('nav-active');
        burger.classList.toggle('toggle');
    });

    async function fetchGalleryImages() {
        const galleryGrid = document.getElementById('gallery-grid');
        if (!galleryGrid) return;
        try {
            const response = await fetch(IMAGE_API_URL);
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                galleryGrid.innerHTML = ''; 
                data.forEach(item => {
                    const galleryItem = document.createElement('div');
                    galleryItem.classList.add('gallery-item');
                    galleryItem.innerHTML = `<img src="${item.img}" alt="${item.Details}"><p>${item.Details}</p>`;
                    galleryGrid.appendChild(galleryItem);
                });
            } else {
                galleryGrid.innerHTML = '<p style="text-align: center;">কোনো ছবি পাওয়া যায়নি।</p>';
            }
        } catch (error) {
            galleryGrid.innerHTML = '<p style="text-align: center;">ছবি লোড করতে সমস্যা হচ্ছে।</p>';
        }
    }

    function setupMessageForm() {
        const messageForm = document.getElementById('message-form');
        const formMessage = document.getElementById('form-message');
        if (messageForm) {
            messageForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                formMessage.textContent = 'বার্তা পাঠানো হচ্ছে...';
                const name = document.getElementById('sender-name').value;
                const message = document.getElementById('message-text').value;
                const data = { data: [{ name, message, timestamp: new Date().toISOString() }] };
                try {
                    const response = await fetch(GOOGLE_SHEETS_API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    const result = await response.json();
                    if (result.created === 1) {
                        formMessage.textContent = 'সফলভাবে পাঠানো হয়েছে!';
                        messageForm.reset();
                        fetchMessages(); 
                    }
                } catch (error) {
                    formMessage.textContent = 'ত্রুটি হয়েছে।';
                }
            });
        }
    }

    async function fetchMessages() {
        const messagesList = document.getElementById('messages-list');
        if (!messagesList) return;
        try {
            const response = await fetch(GOOGLE_SHEETS_API_URL);
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                messagesList.innerHTML = ''; 
                data.reverse().forEach(msg => { 
                    const card = document.createElement('div');
                    card.classList.add('message-card');
                    card.innerHTML = `<strong>${msg.name}</strong><small>${new Date(msg.timestamp).toLocaleString('bn-BD')}</small><p>${msg.message}</p>`;
                    messagesList.appendChild(card);
                });
            }
        } catch (e) { console.error(e); }
    }

    window.addEventListener('load', () => {
        setTimeout(() => loaderWrapper.classList.add('loader-hidden'), 500); 
    });
});
