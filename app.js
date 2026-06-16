
emailjs.init("RahCATBIs1fz_ztFL");

const SUPABASE_URL = "https://avirgehlkrsgrkzicobc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2aXJnZWhsa3JzZ3Jremljb2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMTk0OTUsImV4cCI6MjA5NTg5NTQ5NX0.3vjJko8bx_9Qi5O-BzviegiI84dRi27Y9BToRk0RDuo";

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let productsData = {};
let currentTab = "fiz";
let currentMinRate = 20;
let currentMaxRate = 35;
let currentLang = "ru";

const amountSlider = document.getElementById('amount-slider');
const termSlider = document.getElementById('term-slider');

const amountInput = document.getElementById('amount-input');
const termInput = document.getElementById('term-input');

const monthlyPaymentLbl = document.getElementById('monthly-payment');
const calcRateLbl = document.getElementById('calc-rate-lbl');

const monthlyPaymentMin = document.getElementById('monthly-payment-min');
const monthlyPaymentMax = document.getElementById('monthly-payment-max');



const bannerTranslations = {
    ru: {
        mainTitle: "Кредит-регион",
        mainSlogan: "Быстрый старт для бизнеса, легкое решение для семьи",
        mainAmount: "до 90 000 000 ₸",
        getMoneyBtn: "Получить деньги!",
        
        aboutTitle: "О нас",
        aboutDesc: "За годы своего развития ТОО «МФО «Кредит-регион» успешно использовал свой экономический и управленческий потенциал для обеспечения стабильного роста финансовых показателей, создания устойчивой деловой репутации у клиентов и деловых партнеров и укрепления конкурентоспособности на ранке микрофинансирования.",
        aboutSlogan: "Финансовая помощь, которой можно доверять",
        
        businessTitle: "Деньги для бизнеса",
        businessSlogan: "Надежный партнер в трудную минуту",
        businessFeedback: "Быстрая обратная связь",
        
        anyGoalsTitle: "Микрокредит на любые цели",
        anyGoalsSlogan: "Займы для всех, кто в них нуждается"
    },
    kz: {
        mainTitle: "Кредит-регион",
        mainSlogan: "Бизнес үшін жылдам бастама, отбасы үшін оңтайлы шешім",
        mainAmount: "90 000 000 ₸ дейін",
        getMoneyBtn: "Ақшаны алу!",
        
        aboutTitle: "Біз туралы",
        aboutDesc: "Өзінің даму жылдарында «МФО «Кредит-регион» ЖШС қаржылық көрсеткіштердің тұрақты өсуін қамтамасыз ету, клиенттер мен іскер серіктестер арасында сенімді іскерлік беделді қалыптастыру және микроқаржыландыру нарығында бәсекеге қабілеттілікті нығайту үшін өзінің экономикалық және басқарушылық әлеуетін табысты пайдаланды.",
        aboutSlogan: "Сенімді қаржылық көмек",
        
        businessTitle: "Бизнеске арналған ақша",
        businessSlogan: "Қиын сәттегі сенімді серіктес",
        businessFeedback: "Жылдам кері байланыс",
        
        anyGoalsTitle: "Кез келген мақсатқа арналған микрокредит",
        anyGoalsSlogan: "Мұқтаж жандардың бәріне арналған қарыздар"
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    await loadMfoSettings();
    await loadCreditProducts();
    
if (amountSlider && termSlider) {
        amountSlider.addEventListener('input', () => {
            if (amountInput) amountInput.value = amountSlider.value;
            calculateValues();
            updateSliderProgress(amountSlider);
        });

        termSlider.addEventListener('input', () => {
            if (termInput) termInput.value = termSlider.value;
            calculateValues();
            updateSliderProgress(termSlider);
        });
    }


    if (amountInput) {
        amountInput.addEventListener('input', (e) => {
            let value = parseInt(e.target.value) || 0;
            const max = amountSlider ? parseInt(amountSlider.max) : 10000000;
            if (value > max) { value = max; amountInput.value = max; }
            if (amountSlider) amountSlider.value = value;
            calculateValues();
            if (amountSlider) updateSliderProgress(amountSlider);
        });

        amountInput.addEventListener('blur', (e) => {
            let value = parseInt(e.target.value) || 0;
            const min = amountSlider ? parseInt(amountSlider.min) : 0;
            if (value < min) {
                amountInput.value = min;
                if (amountSlider) amountSlider.value = min;
                calculateValues();
                if (amountSlider) updateSliderProgress(amountSlider);
            }
        });
    }

    if (termInput) {
        termInput.addEventListener('input', (e) => {
            let value = parseInt(e.target.value) || 0;
            const max = termSlider ? parseInt(termSlider.max) : 12;
            if (value > max) { value = max; termInput.value = max; }
            if (termSlider) termSlider.value = value;
            calculateValues();
            if (termSlider) updateSliderProgress(termSlider);
        });

        termInput.addEventListener('blur', (e) => {
            let value = parseInt(e.target.value) || 0;
            const min = termSlider ? parseInt(termSlider.min) : 1;
            if (value < min) {
                termInput.value = min;
                if (termSlider) termSlider.value = min;
                calculateValues();
                if (termSlider) updateSliderProgress(termSlider);
            }
        });
    }
});

async function loadMfoSettings() {
    const { data, error } = await _supabase
        .from('mfo_settings')
        .select('*')
        .eq('id', 1)
        .single();

    if (error) {
        console.error("Ошибка загрузки настроек: ", error);
        return;
    }


    if (document.getElementById('phone-1') && data.phones && data.phones[0]) {
        document.getElementById('phone-1').innerText = data.phones[0];
        document.getElementById('phone-1').href = `tel:${data.phones[0].replace(/[^0-9+]/g, '')}`;
    }
    if (document.getElementById('mfo-bin')) document.getElementById('mfo-bin').innerText = data.bin;
    if (document.getElementById('mfo-iik')) document.getElementById('mfo-iik').innerText = data.iik;
    if (document.getElementById('mfo-bik')) document.getElementById('mfo-bik').innerText = data.bik;

    if (document.getElementById('mfo-hours')) {
        document.getElementById('mfo-hours').innerText = data[`work_hours_${currentLang}`] || data.work_hours;
    }
    if (document.getElementById('mfo-address')) {
        document.getElementById('mfo-address').innerText = data[`address_${currentLang}`] || data.address;
    }
    if (document.getElementById('mfo-bank')) {
        document.getElementById('mfo-bank').innerText = data[`bank_name_${currentLang}`] || data.bank_name;
    }

    if (document.getElementById('calc-label-rate')) {
        const value = data[`GESB${currentLang}`] || data.GESB;
        document.getElementById('calc-label-rate').innerText = `${value}%`;
    }

    const formattedDate = new Date(data.order_date).toLocaleDateString(currentLang === 'ru' ? 'ru-RU' : 'kk-KZ');
    
    const orderNode = document.getElementById('mfo-order');
    if (orderNode) {
        if (currentLang === 'ru') {
            orderNode.innerText = `Условия предоставления microcredit-ов утверждены приказом № ${data.order_number} от ${formattedDate} г.`;
        } else {
            orderNode.innerText = `Микрокредит беру шарттары ${formattedDate} ж. № ${data.order_number} бұйрығымен бекітілген.`;
        }
    }
}

async function loadCreditProducts() {
    const { data, error } = await _supabase
        .from('credit_products')
        .select('*');
    
    if (error) {
        console.error("Ошибка загрузки продуктов: ", error);
        return;
    }

    data.forEach(item => {
        productsData[item.type] = item;
    });

    updatePageData();

    calculateValues();
}

function updatePageData() {
    const currentProduct = productsData[currentTab];
    const suffix = currentLang === 'ru' ? 'мес.' : 'ай';

    if (currentProduct) {
        currentMinRate = currentProduct.rate_min;
        currentMaxRate = currentProduct.rate_max;
        

        if (termSlider) {
            termSlider.min = currentProduct.term_min;
            termSlider.max = currentProduct.term_max;
            termSlider.step = 1;
            termSlider.value = currentProduct.term_min; 
            if (termInput) termInput.value = termSlider.value;
        }

        if (amountSlider) {
            const minAmt = currentProduct.amount_min;
            const maxAmt = currentProduct.amount_max;
            
            amountSlider.min = minAmt;
            amountSlider.max = maxAmt;
            
            amountSlider.step = maxAmt > 5000000 ? 50000 : 5000;
            amountSlider.value = minAmt; 
            if (amountInput) amountInput.value = amountSlider.value;
        }
    }

    const rate = document.getElementById('rate')

    if(rate) {
        rate.innerText = `${currentProduct.rate_max}% годовых`;
    }

    const termMinLbl = document.getElementById('term-min-lbl');
    const termMaxLbl = document.getElementById('term-max-lbl');
    if (termMinLbl && termSlider) termMinLbl.innerText = `${termSlider.min} ${suffix}`;
    if (termMaxLbl && termSlider) termMaxLbl.innerText = `${termSlider.max} ${suffix}`;

    const amountMinLbl = document.getElementById('amount-min-lbl');
    const amountMaxLbl = document.getElementById('amount-max-lbl');
    if (amountMinLbl && amountSlider) amountMinLbl.innerText = `${parseInt(amountSlider.min).toLocaleString('ru-RU')} ₸`;
    if (amountMaxLbl && amountSlider) amountMaxLbl.innerText = `${parseInt(amountSlider.max).toLocaleString('ru-RU')} ₸`;

    const termUnitNode = document.getElementById('term-unit');
    if (termUnitNode) termUnitNode.innerText = suffix;

    
    calculateValues();
    if (amountSlider) updateSliderProgress(amountSlider);
    if (termSlider) updateSliderProgress(termSlider);


    const reqList = document.getElementById('requirements-list');
    if (reqList) {
        reqList.innerHTML = '';
        const reqColumnName = `requirements_${currentLang}`; 
        const reqsToRender = (currentProduct && currentProduct[reqColumnName]) ? currentProduct[reqColumnName] : [];
        
        reqsToRender.forEach(text => {
            reqList.innerHTML += `<li>${text}</li>`;
        });
    }

    const docList = document.getElementById('documents-list');
    if (docList) {
        docList.innerHTML = '';
        const docColumnName = `documents_list_${currentLang}`; 
        const docsToRender = (currentProduct && currentProduct[docColumnName]) ? currentProduct[docColumnName] : [];
        
        docsToRender.forEach(text => {
            docList.innerHTML += `<li>${text}</li>`;
        });
    } 
    calculateValues();
}


function switchTab(tabType) {
    if (currentTab === tabType) return;
    currentTab = tabType;

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (window.event && window.event.target) {
        window.event.target.classList.add('active');
    }

    updatePageData();
    calculateValues();
}


function calculateValues() {
    if (!amountSlider || !termSlider) return;

    const amount = amountInput ? (parseInt(amountInput.value) || 0) : parseInt(amountSlider.value);
    const months = termInput ? (parseInt(termInput.value) || 1) : parseInt(termSlider.value);


    const minEl = monthlyPaymentMin || document.getElementById('monthly-payment-min');
    const maxEl = monthlyPaymentMax || document.getElementById('monthly-payment-max');

    if (amount <= 0) {
        if (minEl) minEl.innerText = "0";
        if (maxEl) maxEl.innerText = "0";
        return;
    }

    const minRate = currentMinRate || 20;
    const maxRate = currentMaxRate || 35;

    if (calcRateLbl) {
        calcRateLbl.innerText = `${minRate.toFixed(1)}% — ${maxRate.toFixed(1)}%`;
    }

    function calculateAnnuity(sum, termMonths, yearlyRate) {
        const monthlyRate = (yearlyRate / 100) / 12;
        if (monthlyRate === 0) {
            return sum / termMonths;
        } else {
            return sum * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
        }
    }

    const minPayment = calculateAnnuity(amount, months, minRate);
    const maxPayment = calculateAnnuity(amount, months, maxRate);

    if (minEl) minEl.innerText = Math.round(minPayment).toLocaleString('ru-RU');
    if (maxEl) maxEl.innerText = Math.round(maxPayment).toLocaleString('ru-RU');
}

function changeLang(lang) {
    if (currentLang === lang) return;
    currentLang = lang;

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText.toLowerCase() === lang) {
            btn.classList.add('active');
        }
    });

    const navMain = document.getElementById('nav-main');
    const navAbout = document.getElementById('nav-about');
    const navContacts = document.getElementById('nav-contacts');

    let currentPath = window.location.pathname;
    let pageName = currentPath.substring(currentPath.lastIndexOf("/") + 1);
    if (pageName === "") pageName = "index.html";

    if (pageName === 'about.html' && lang === 'kz') {
        window.location.href = 'about_kz.html';
        return;
    }
    if (pageName === 'about_kz.html' && lang === 'ru') {
        window.location.href = 'about.html';
        return;
    }

    const hMainTitle = document.getElementById('hero-main-title');
    const hMainSlogan = document.getElementById('hero-main-slogan');
    const hMainAmount = document.getElementById('hero-main-amount');
    const hMainBtn = document.getElementById('hero-main-btn');
    const hAboutTitle = document.getElementById('hero-about-title');
    const hAboutDesc = document.getElementById('hero-about-desc');
    const hAboutSlogan = document.getElementById('hero-about-slogan');
    const hBusinessTitle = document.getElementById('hero-business-title');
    const hBusinessSlogan = document.getElementById('hero-business-slogan');
    const hBusinessFeedback = document.getElementById('hero-business-feedback');
    const hAnyTitle = document.getElementById('hero-any-title');
    const hAnySlogan = document.getElementById('hero-any-slogan');

    const calcTitle = document.getElementById('calc-title');
    const calcLabelAmount = document.getElementById('calc-label-amount');
    const calcLabelTerm = document.getElementById('calc-label-term');
    const termUnit = document.getElementById('term-unit');
    const calcLabelResult = document.getElementById('calc-label-result');
    const openModalBtn = document.getElementById('open-modal-btn');
    const calcLabelRate = document.getElementById('calc-label-rate');
    const tabFiz = document.getElementById('tab-fiz');
    const tabYur = document.getElementById('tab-yur');
    const infoReqTitle = document.getElementById('info-req-title');
    const infoDocsTitle = document.getElementById('info-docs-title');
    const reqLoading = document.getElementById('req-loading');
    const docsLoading = document.getElementById('docs-loading');

    const docsSectionTitle = document.getElementById('docs-section-title');
    const docsSectionSubtitle = document.getElementById('docs-section-subtitle');
    const docRulesTitle = document.getElementById('doc-rules-title');
    const docRulesAction = document.getElementById('doc-rules-action');
    const docLicenseTitle = document.getElementById('doc-license-title');
    const docLicenseAction = document.getElementById('doc-license-action');

    const mfoHours = document.getElementById('mfo-hours');
    const mfoAddress = document.getElementById('mfo-address');
    const mfoEmail = document.getElementById('mfo-email')
    const footerReqTitle = document.getElementById('footer-req-title');
    const footerBinLabel = document.getElementById('footer-bin-label');
    const footerIikLabel = document.getElementById('footer-iik-label');
    const footerBikLabel = document.getElementById('footer-bik-label');
    const mfoBank = document.getElementById('mfo-bank');
    const mfoOrder = document.getElementById('mfo-order');
    const mfoLicense = document.getElementById('mfo-license');
    const footerCopyright = document.getElementById('footer-copyright');

    if (lang === 'kz') {
        if (navMain) navMain.textContent = 'Басты бет';
        
        if (navAbout) {
            navAbout.textContent = 'Есептіліктер';
            navAbout.href = 'reports_kz.html';
        }
        
        if (navContacts) {
            navContacts.textContent = 'Байланыс';
            navContacts.href = 'contacts_kz.html';
        }

        if (hMainTitle) hMainTitle.textContent = 'Кредит-регион';
        if (hMainSlogan) hMainSlogan.textContent = 'Бизнес үшін жылдам бастама, отбасы үшін оңтайлы шешім';
        if (hMainAmount) hMainAmount.textContent = '90 000 000 ₸ дейін';
        if (hMainBtn) hMainBtn.textContent = 'Ақшаны алу!';
        if (hAboutTitle) hAboutTitle.textContent = 'Біз туралы';
        if (hAboutDesc) hAboutDesc.textContent = 'Өзінің даму жылдарында «МФО «Кредит-регион» ЖШС қаржылық көрсеткіштердің тұрақты өсуін қамтамасыз ету, клиенттер мен іскер серіктестер арасында сенімді іскерлік беделді қалыптастыру және микроқаржыландыру нарығында бәсекеге қабілеттілікті нығайту үшін өзінің экономикалық және басқарушылық әлеуетін табысты пайдаланды.';
        if (hAboutSlogan) hAboutSlogan.textContent = 'Сенімді қаржылық көмек';
        if (hBusinessTitle) hBusinessTitle.textContent = 'Бизнеске арналған ақша';
        if (hBusinessSlogan) hBusinessSlogan.textContent = 'Қиын сәттегі сенімді серіктес';
        if (hBusinessFeedback) hBusinessFeedback.textContent = 'Жылдам кері байланыс';
        if (hAnyTitle) hAnyTitle.textContent = 'Кез келген мақсатқа арналған микрокредит';
        if (hAnySlogan) hAnySlogan.textContent = 'Мұқтаж жандардың бәріне арналған қарыздар';

        if (calcTitle) calcTitle.textContent = 'Кредитіңізді есептеңіз';
        if (calcLabelAmount) calcLabelAmount.textContent = 'Кредит сомасы';
        if (calcLabelTerm) calcLabelTerm.textContent = 'Кредит мерзімі';
        if (termUnit) termUnit.textContent = 'ай';
        if (calcLabelResult) calcLabelResult.textContent = 'Ай сайынғы төлем:';
        if (openModalBtn) openModalBtn.textContent = 'Өтініш қалдырыңыз';
        if (calcLabelRate) calcLabelRate.textContent = 'ЖТСМ 22%-дан бастап';
        if (tabFiz) tabFiz.textContent = 'Жеке тұлғаларға';
        if (tabYur) tabYur.textContent = 'Заңды тұлғаларға';
        if (infoReqTitle) infoReqTitle.textContent = 'Қарыз алушыға қойылатын талаптар';
        if (infoDocsTitle) infoDocsTitle.textContent = 'Қажетті құжаттар';
        if (reqLoading) reqLoading.textContent = 'Деректер жүктелуде...';
        if (docsLoading) docsLoading.textContent = 'Деректер жүктелуде...';

        if (docsSectionTitle) docsSectionTitle.textContent = 'Ұйымның ресми құжаттары';
        if (docsSectionSubtitle) docsSectionSubtitle.textContent = 'ҚР заңнамасына сәйкес МФО-ның барлық қызметі ашық';
        if (docRulesTitle) docRulesTitle.textContent = 'Микрокредиттер беру қағидалары';
        if (docRulesAction) docRulesAction.textContent = 'PDF құжатын жүктеу';
        if (docLicenseTitle) docLicenseTitle.textContent = 'АРРФР ресми лицензиясы';
        if (docLicenseAction) docLicenseAction.textContent = 'Скан-көшірмені көру';


        if (mfoHours) mfoHours.textContent = 'Жұмыс режимі: Дс-Жм 9:00-ден 18:00-ге дейін';
        if (mfoAddress) mfoAddress.textContent = 'Мекенжайы: Қарағанды қ., Костенко көш., 6 үй, 61 кеңсе';
        if (mfoEmail) mfoEmail.textContent = 'Электрондық пошта: mfo_kredit_region@mail.ru'
        if (footerReqTitle) footerReqTitle.textContent = 'Компанияның деректемелері:';
        if (footerBinLabel) footerBinLabel.textContent = 'БСН:';
        if (footerIikLabel) footerIikLabel.textContent = 'ЖБН:';
        if (footerBikLabel) footerBikLabel.textContent = 'БИК:';
        if (mfoBank) mfoBank.textContent = '«БанкЦентрКредит» АҚ';
        if (mfoOrder) mfoOrder.textContent = 'Микрокредиттер беру шарттары 15.01.2026 ж. № 12-П бұйрығымен бекітілген.';
        if (mfoLicense) mfoLicense.textContent = 'Қазақстан Республикасы Қаржы нарығын реттеу және дамыту агенттігінің Қарағанды қаласындағы өңірлік өкілдіктері басқармасы берген 29.03.2021 жылғы № 09.21.0014.M микроқаржылық қызметті жүзеге асыруға арналған лицензия.';
        if (footerCopyright) footerCopyright.textContent = '© 2026 «Кредит-Регион» МФО ЖШС. Барлық құқықтар қорғалған.';

    } else {
        if (navMain) navMain.textContent = 'Главная';
        
        if (navAbout) {
            navAbout.textContent = 'Отчеты';
            navAbout.href = 'reports.html';
        }
        
        if (navContacts) {
            navContacts.textContent = 'Контакты';
            navContacts.href = 'contacts.html';
        }

        if (hMainTitle) hMainTitle.textContent = 'Кредит-регион';
        if (hMainSlogan) hMainSlogan.textContent = 'Быстрый старт для бизнеса, легкое решение для семьи';
        if (hMainAmount) hMainAmount.textContent = 'до 90 000 000 ₸';
        if (hMainBtn) hMainBtn.textContent = 'Получить деньги!';
        if (hAboutTitle) hAboutTitle.textContent = 'О нас';
        if (hAboutDesc) hAboutDesc.textContent = 'За годы своего развития ТОО «МФО «Кредит-регион» успешно использовал свой economic и управленческий потенциал для обеспечения стабильного роста финансовых показателей, создания устойчивой деловой репутации у клиентов и деловых партнеров и укрепления конкурентоспособности на ранке микрофинансирования.';
        if (hAboutSlogan) hAboutSlogan.textContent = 'Финансовая помощь, которой можно доверять';
        if (hBusinessTitle) hBusinessTitle.textContent = 'Деньги для бизнеса';
        if (hBusinessSlogan) hBusinessSlogan.textContent = 'Надежный партнер в трудную минуту';
        if (hBusinessFeedback) hBusinessFeedback.textContent = 'Быстрая обратная связь';
        if (hAnyTitle) hAnyTitle.textContent = 'Микрокредит на любые цели';
        if (hAnySlogan) hAnySlogan.textContent = 'Займы для всех, кто в них нуждается';

        if (calcTitle) calcTitle.textContent = 'Рассчитайте свой кредит';
        if (calcLabelAmount) calcLabelAmount.textContent = 'Сумма кредита';
        if (calcLabelTerm) calcLabelTerm.textContent = 'Срок кредитования';
        if (termUnit) termUnit.textContent = 'мес.';
        if (calcLabelResult) calcLabelResult.textContent = 'Ежемесячный платеж:';
        if (openModalBtn) openModalBtn.textContent = 'Оставить заявку';
        if (calcLabelRate) calcLabelRate.textContent = 'ГЭСВ от 22%';
        if (tabFiz) tabFiz.textContent = 'Физическим лицам';
        if (tabYur) tabYur.textContent = 'Юридическим лицам';
        if (infoReqTitle) infoReqTitle.textContent = 'Требования к заемщику';
        if (infoDocsTitle) infoDocsTitle.textContent = 'Необходимые документы';
        if (reqLoading) reqLoading.textContent = 'Загрузка данных...';
        if (docsLoading) docsLoading.textContent = 'Загрузка данных...';

        if (docsSectionTitle) docsSectionTitle.textContent = 'Официальные документы организации';
        if (docsSectionSubtitle) docsSectionSubtitle.textContent = 'В соответствии с законодательством РК вся деятельность МФО прозрачна';
        if (docRulesTitle) docRulesTitle.textContent = 'Правила предоставления микрокредитов';
        if (docRulesAction) docRulesAction.textContent = 'Скачать PDF-документ';
        if (docLicenseTitle) docLicenseTitle.textContent = 'Официальная лицензия АРРФР';
        if (docLicenseAction) docLicenseAction.textContent = 'Посмотреть скан-копию';

        if (mfoHours) mfoHours.textContent = 'Режим работы: Пн-Пт с 9:00 до 18:00';
        if (mfoAddress) mfoAddress.textContent = 'Адрес: г. Караганда, ул. Костенко, д. 6, офис 61';
        if (mfoEmail) mfoEmail.textContent = 'Электронная почта: mfo_kredit_region@mail.ru';
        if (footerReqTitle) footerReqTitle.textContent = 'Реквизиты компании:';
        if (footerBinLabel) footerBinLabel.textContent = 'БИН:';
        if (footerIikLabel) footerIikLabel.textContent = 'ИИК:';
        if (footerBikLabel) footerBikLabel.textContent = 'БИК:';
        if (mfoBank) mfoBank.textContent = 'АО «БанкЦентрКредит»';
        if (mfoOrder) mfoOrder.textContent = 'Условия предоставления микрокредитов утверждены приказом № 12-П от 15.01.2026 г.';
        if (mfoLicense) mfoLicense.textContent = 'Лицензия на осуществление микрофинансовой деятельности № 09.21.0014.M от 29.03.2021 года, выданная Управлением региональных представителей в г. Караганда Агентства РК по регулированию и развитию финансовых рынков.';
        if (footerCopyright) footerCopyright.textContent = '© 2026 ТОО МФО «Кредит-Регион». Все права защищены.';
    }

    updatePageData();
    loadMfoSettings();

    localStorage.setItem('site_lang', lang);
    loadDynamicDocuments();
}

function updateSliderProgress(slider) {
    if (!slider) return;
    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 100;
    const value = parseFloat(slider.value) || 0;
    
    const percentage = ((value - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, #006A8E 0%, #006A8E ${percentage}%, #cbd5e1 ${percentage}%, #cbd5e1 100%)`;
}

async function loadDynamicDocuments() {
    const container = document.getElementById('dynamic-docs-container');
    if (!container) return;

    const { data: docs, error } = await _supabase.from('documents').select('*');

    if (error) {
        console.error("Ошибка загрузки доков:", error);
        return;
    }

    const currentLang = localStorage.getItem('site_lang') || 'ru';

    container.innerHTML = docs.map(doc => {

        const { data } = _supabase.storage.from('loan-documents').getPublicUrl(doc.file_path);
        const fileUrl = data.publicUrl;
        
        const title = currentLang === 'kz' ? (doc.name_kz || doc.name_ru) : doc.name_ru;
        const actionText = currentLang === 'kz' ? 'Құжатты көру' : 'Посмотреть документ';

  
        const createdLabel = currentLang === 'kz' ? 'Құрылды:' : 'Создан:';
        const updatedLabel = currentLang === 'kz' ? 'Жаңартылды:' : 'Обновлен:';

     
        const dateLocale = currentLang === 'kz' ? 'kk-KZ' : 'ru-RU';
        const createdDate = doc.created_at ? new Date(doc.created_at).toLocaleDateString(dateLocale) : '—';
        const updatedDate = doc.updated_at ? new Date(doc.updated_at).toLocaleDateString(dateLocale) : createdDate;

        return `
            <a href="${fileUrl}" target="_blank" class="doc-item">
                <div class="doc-icon">📄</div>
                <div class="doc-info">
                    <h4>${title}</h4>
                    <span>${actionText}</span>
                    
                    <div class="doc-dates">
                        <div class="doc-date-row">
                            <span class="date-label">${createdLabel}</span>
                            <span class="date-value">${createdDate}</span>
                        </div>
                        <div class="doc-date-row">
                            <span class="date-label">${updatedLabel}</span>
                            <span class="date-value">${updatedDate}</span>
                        </div>
                    </div>
                </div>
            </a>
        `;
    }).join('');
}





//заявка
document.addEventListener('DOMContentLoaded', () => {
    loadDynamicDocuments();


    
    const modal = document.getElementById("phone-modal");
    const closeBtn = document.querySelector(".close-modal-btn");
    const cancelBtn = document.getElementById("cancel-submit-btn");
    const confirmBtn = document.getElementById("confirm-submit-btn");
    const nameInput = document.getElementById("modal-name-input");
    const phoneInput = document.getElementById("modal-phone-input");

    const consentCheckbox = document.getElementById("consent-checkbox");

    confirmBtn.disabled = true;

    consentCheckbox.addEventListener("change", () => {
    confirmBtn.disabled = !consentCheckbox.checked;
    });
    
    let currentAmount = "";
    let currentTerm = "";

    document.getElementById("open-modal-btn")?.addEventListener("click", () => {
        currentAmount = document.getElementById("amount-input").value;
        currentTerm = document.getElementById("term-input").value;

        nameInput.value = "";
        phoneInput.value = "";
        consentCheckbox.checked = false;
        confirmBtn.disabled = true;
        modal.style.display = "flex";
    });
    const closeModal = () => {
        modal.style.display = "none";
    };

    closeBtn?.addEventListener("click", closeModal);
    cancelBtn?.addEventListener("click", closeModal);

    window.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });


    confirmBtn?.addEventListener("click", () => {
        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();

        if (!name) {
            alert("Пожалуйста, введите ваше имя.");
            return;
        }
        if (!phone) {
            alert("Пожалуйста, введите номер телефона.");
            return;
        }
        if (!consentCheckbox.checked) {
        alert("Необходимо согласиться на обработку персональных данных.");
        return;
        }

        const templateParams = {
            name: name, 
            amount: currentAmount,
            term: currentTerm,
            phone: phone
        };

        confirmBtn.disabled = true;
        confirmBtn.innerText = "Отправка...";

        emailjs.send("service_kxq0qec", "template_d0dwiv4", templateParams)
            .then((response) => {
                console.log('Письмо успешно отправлено!', response.status, response.text);
                alert('Благодарим! Заявка успешно отправлена, мы свяжемся с вами.');
                closeModal();
            })
            .catch((error) => {
                console.error('Ошибка отправки EmailJS:', error);
                alert('Произошла ошибка при отправке заявки. Попробуйте позже.');
            })
            .finally(() => {
                confirmBtn.disabled = false;
                confirmBtn.innerText = "OK";
            });
    });
});