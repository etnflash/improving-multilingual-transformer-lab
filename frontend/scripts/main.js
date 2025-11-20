const MANIFEST_PATH = "data/languages/manifest.json";
const languageCache = new Map();
const appendixCache = new Map();
let languageManifest = null;
let activeLanguageCode = null;
let languageStatusEl;
let activeLanguageLabelEl;
let languagePickerEl;
let appendixLanguageEl;
let appendixLevelEl;
const appendixStatusEls = {};
const appendixBodyEls = {};

document.addEventListener("DOMContentLoaded", () => {
    setupSmoothScroll();
    markWidgetPlaceholders();
    initializeLanguageLayer();
});

function setupSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.getAttribute("href");
            const target = targetId ? document.querySelector(targetId) : null;

            if (target) {
                event.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "start" });
                history.replaceState(null, "", targetId);
            }
        });
    });
}

function markWidgetPlaceholders() {
    const patternPracticeRoot = document.getElementById("pattern-practice-root");
    const sentenceCorrectionRoot = document.getElementById("sentence-correction-root");
    const tokenizationRoot = document.getElementById("tokenization-root");
    const attentionRoot = document.getElementById("attention-root");

    if (patternPracticeRoot) {
        patternPracticeRoot.dataset.status = "idle";
    }

    if (sentenceCorrectionRoot) {
        sentenceCorrectionRoot.dataset.status = "idle";
    }

    if (tokenizationRoot) {
        tokenizationRoot.dataset.status = "idle";
    }

    if (attentionRoot) {
        attentionRoot.dataset.status = "idle";
    }
}

async function initializeLanguageLayer() {
    languageStatusEl = document.getElementById("language-status");
    activeLanguageLabelEl = document.getElementById("active-language-label");
    languagePickerEl = document.getElementById("language-picker");

    if (!languageStatusEl || !activeLanguageLabelEl || !languagePickerEl) {
        return;
    }

    try {
        setLanguageStatus("Loading language manifest...", { busy: true });
        languageManifest = await fetchJSON(MANIFEST_PATH);
        initializeAppendixControls();
        populateLanguagePicker(languageManifest.languages);
        const initialCode = resolveInitialLanguage(languageManifest);
        if (initialCode) {
            languagePickerEl.value = initialCode;
            setPickerDisabled(true);
            await loadLanguage(initialCode, { silent: true });
            await syncAppendixLanguage(initialCode);
            setPickerDisabled(false);
            languagePickerEl.addEventListener("change", async (event) => {
                const nextCode = event.target.value;
                await loadLanguage(nextCode);
                await syncAppendixLanguage(nextCode);
            });
        } else {
            setLanguageStatus("No languages available. Add entries to manifest.json.", { error: true });
        }
    } catch (error) {
        console.error("Language layer initialization failed", error);
        setLanguageStatus("Unable to load language data. Please refresh.", { error: true });
    }
}

function populateLanguagePicker(languages = []) {
    languagePickerEl.innerHTML = "";
    languages.forEach((lang) => {
        const option = document.createElement("option");
        option.value = lang.code;
        option.textContent = `${lang.name} (${lang.nativeName})`;
        if (lang.status && lang.status !== "live") {
            option.disabled = true;
            option.textContent += " - coming soon";
        }
        languagePickerEl.appendChild(option);
    });
}

function resolveInitialLanguage(manifest) {
    if (!manifest || !Array.isArray(manifest.languages)) {
        return null;
    }

    if (manifest.defaultLanguage) {
        return manifest.defaultLanguage;
    }

    const firstLive = manifest.languages.find((lang) => !lang.status || lang.status === "live");
    return firstLive ? firstLive.code : null;
}

async function loadLanguage(code, { silent = false } = {}) {
    if (!code) {
        return;
    }

    if (!silent) {
        setPickerDisabled(true);
        setLanguageStatus(`Loading ${code.toUpperCase()} content...`, { busy: true });
    }

    try {
        const data = await getLanguageData(code);
        activeLanguageCode = code;
        document.documentElement.dataset.activeLanguage = code;
        updateActiveLanguageLabel(data);
        exposeLabAPI();
        setLanguageStatus(`${data.language.name} data ready.`);
    } catch (error) {
        console.error(`Failed to load language ${code}`, error);
        setLanguageStatus(`Could not load ${code.toUpperCase()} data.`, { error: true });
    } finally {
        if (!silent) {
            setPickerDisabled(false);
        }
    }
}

async function getLanguageData(code) {
    if (languageCache.has(code)) {
        return languageCache.get(code);
    }

    const payload = await fetchJSON(`data/languages/${code}.json`);
    languageCache.set(code, payload);
    return payload;
}

async function fetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Request failed for ${url} with status ${response.status}`);
    }
    return response.json();
}

function updateActiveLanguageLabel(payload) {
    if (!activeLanguageLabelEl || !payload || !payload.language) {
        return;
    }

    const { name, nativeName, level } = payload.language;
    const parts = [name];
    if (nativeName && nativeName !== name) {
        parts.push(nativeName);
    }
    if (level) {
        parts.push(`Level ${level}`);
    }
    activeLanguageLabelEl.textContent = parts.join(" · ");
}

function setLanguageStatus(message, { busy = false, error = false } = {}) {
    if (!languageStatusEl) {
        return;
    }

    languageStatusEl.textContent = message;
    languageStatusEl.setAttribute("aria-busy", busy ? "true" : "false");
    if (error) {
        languageStatusEl.classList.add("is-error");
    } else {
        languageStatusEl.classList.remove("is-error");
    }
}

function exposeLabAPI() {
    window.ImProvingLab = {
        getManifest: () => languageManifest,
        getActiveLanguageCode: () => activeLanguageCode,
        getActiveLanguageData: () => languageCache.get(activeLanguageCode)
    };
}

function setPickerDisabled(disabled) {
    if (languagePickerEl) {
        languagePickerEl.disabled = disabled;
    }
}

function initializeAppendixControls() {
    appendixLanguageEl = document.getElementById("appendix-language");
    appendixLevelEl = document.getElementById("appendix-level");
    appendixStatusEls.grammar = document.getElementById("appendix-grammar-status");
    appendixStatusEls.vocabulary = document.getElementById("appendix-vocabulary-status");
    appendixStatusEls.conversation = document.getElementById("appendix-conversation-status");
    appendixStatusEls.patterns = document.getElementById("appendix-patterns-status");
    appendixBodyEls.grammar = document.getElementById("appendix-grammar");
    appendixBodyEls.vocabulary = document.getElementById("appendix-vocabulary");
    appendixBodyEls.conversation = document.getElementById("appendix-conversation");
    appendixBodyEls.patterns = document.getElementById("appendix-patterns");

    if (!appendixLanguageEl || !appendixLevelEl || !languageManifest) {
        return;
    }

    populateAppendixLanguages();
    appendixLanguageEl.addEventListener("change", async (event) => {
        await syncAppendixLanguage(event.target.value);
    });

    appendixLevelEl.addEventListener("change", async (event) => {
        const langCode = appendixLanguageEl.value;
        if (langCode && event.target.value) {
            await loadAppendixBundle(langCode, event.target.value);
        }
    });
}

async function syncAppendixLanguage(code) {
    if (!appendixLanguageEl || !appendixLevelEl || !code) {
        return;
    }

    appendixLanguageEl.value = code;
    populateAppendixLevels(code);
    const levelValue = appendixLevelEl.value;
    if (levelValue) {
        await loadAppendixBundle(code, levelValue);
    } else {
        clearAppendixPanels();
    }
}

function populateAppendixLanguages() {
    appendixLanguageEl.innerHTML = "";
    if (!languageManifest || !Array.isArray(languageManifest.languages)) {
        return;
    }

    languageManifest.languages.forEach((lang) => {
        const option = document.createElement("option");
        option.value = lang.code;
        option.textContent = `${lang.name}`;
        appendixLanguageEl.appendChild(option);
    });
}

function populateAppendixLevels(langCode) {
    if (!appendixLevelEl) {
        return;
    }
    appendixLevelEl.innerHTML = "";
    const meta = languageManifest.languages.find((lang) => lang.code === langCode);
    if (!meta || !Array.isArray(meta.levels) || meta.levels.length === 0) {
        return;
    }

    meta.levels.forEach((level, index) => {
        const option = document.createElement("option");
        option.value = level.id;
        option.textContent = level.label || level.id;
        if (index === 0) {
            option.selected = true;
        }
        appendixLevelEl.appendChild(option);
    });
}

async function loadAppendixBundle(langCode, level) {
    if (!langCode || !level) {
        return;
    }

    setAppendixStatus("grammar", `Loading ${langCode.toUpperCase()} grammar for ${level}...`, { busy: true });
    setAppendixStatus("vocabulary", "Loading vocabulary...", { busy: true });
    setAppendixStatus("conversation", "Loading conversation scenes...", { busy: true });
    setAppendixStatus("patterns", "Loading patterns...", { busy: true });
    clearAppendixBodies();

    try {
        const bundle = await getAppendixData(langCode, level);
        renderGrammar(bundle.grammar);
        renderVocabulary(bundle.vocabulary);
        renderConversation(bundle.conversation);
        renderPatterns(bundle.patterns);
    } catch (error) {
        console.error("Failed to load appendix bundle", error);
        setAppendixStatus("grammar", "Unable to load appendix data.", { error: true });
        setAppendixStatus("vocabulary", "", { error: true });
        setAppendixStatus("conversation", "", { error: true });
        setAppendixStatus("patterns", "", { error: true });
    }
}

async function getAppendixData(langCode, level) {
    const cacheKey = `${langCode}-${level}`;
    if (appendixCache.has(cacheKey)) {
        return appendixCache.get(cacheKey);
    }

    const basePath = `data/languages/${langCode}/levels/${level}`;
    const [grammar, vocabulary, conversation, patterns] = await Promise.all([
        fetchJSON(`${basePath}/grammar.json`),
        fetchJSON(`${basePath}/vocabulary.json`),
        fetchJSON(`${basePath}/conversation.json`),
        fetchOptionalJSON(`${basePath}/patterns.json`)
    ]);

    const payload = { grammar, vocabulary, conversation, patterns };
    appendixCache.set(cacheKey, payload);
    return payload;
}

async function fetchOptionalJSON(url) {
    try {
        return await fetchJSON(url);
    } catch (error) {
        return null;
    }
}

function renderGrammar(data) {
    const container = appendixBodyEls.grammar;
    if (!container) {
        return;
    }
    container.innerHTML = "";
    const topics = data && Array.isArray(data.topics) ? data.topics : [];
    if (topics.length === 0) {
        setAppendixStatus("grammar", "No grammar topics yet.");
        return;
    }
    setAppendixStatus("grammar", `Loaded ${topics.length} grammar topic(s).`);
    topics.forEach((topic) => {
        const card = document.createElement("div");
        card.className = "appendix-card";
        const title = document.createElement("h4");
        title.textContent = topic.title;
        const summary = document.createElement("p");
        summary.textContent = topic.summary;
        card.append(title, summary);
        if (Array.isArray(topic.points) && topic.points.length) {
            const list = document.createElement("ul");
            topic.points.forEach((point) => {
                const li = document.createElement("li");
                li.textContent = point;
                list.appendChild(li);
            });
            card.appendChild(list);
        }
        if (Array.isArray(topic.examples) && topic.examples.length) {
            const examplesTitle = document.createElement("p");
            examplesTitle.className = "appendix-meta";
            examplesTitle.textContent = "Examples";
            card.appendChild(examplesTitle);
            topic.examples.forEach((example) => {
                const exampleBlock = document.createElement("p");
                exampleBlock.innerHTML = `<strong>${example.sentence}</strong><br>${example.translation}`;
                if (example.explanation) {
                    const explain = document.createElement("span");
                    explain.className = "appendix-meta";
                    explain.textContent = example.explanation;
                    exampleBlock.appendChild(document.createElement("br"));
                    exampleBlock.appendChild(explain);
                }
                card.appendChild(exampleBlock);
            });
        }
        container.appendChild(card);
    });
}

function renderVocabulary(data) {
    const container = appendixBodyEls.vocabulary;
    if (!container) {
        return;
    }
    container.innerHTML = "";
    const sets = data && Array.isArray(data.sets) ? data.sets : [];
    if (sets.length === 0) {
        setAppendixStatus("vocabulary", "No vocabulary sets yet.");
        return;
    }
    setAppendixStatus("vocabulary", `Loaded ${sets.length} set(s).`);
    sets.forEach((set) => {
        const card = document.createElement("div");
        card.className = "appendix-card";
        const title = document.createElement("h4");
        title.textContent = set.title;
        card.appendChild(title);
        if (Array.isArray(set.words)) {
            const list = document.createElement("ul");
            set.words.forEach((entry) => {
                const li = document.createElement("li");
                li.innerHTML = `<strong>${entry.term}</strong> — ${entry.translation}`;
                if (entry.note) {
                    const meta = document.createElement("span");
                    meta.className = "appendix-meta";
                    meta.textContent = ` (${entry.note})`;
                    li.appendChild(meta);
                }
                list.appendChild(li);
            });
            card.appendChild(list);
        }
        container.appendChild(card);
    });
}

function renderConversation(data) {
    const container = appendixBodyEls.conversation;
    if (!container) {
        return;
    }
    container.innerHTML = "";
    const scenes = data && Array.isArray(data.scenes) ? data.scenes : [];
    if (scenes.length === 0) {
        setAppendixStatus("conversation", "No conversation scenes yet.");
        return;
    }
    setAppendixStatus("conversation", `Loaded ${scenes.length} scene(s).`);
    scenes.forEach((scene) => {
        const card = document.createElement("div");
        card.className = "appendix-card";
        const title = document.createElement("h4");
        title.textContent = scene.title;
        const summary = document.createElement("p");
        summary.textContent = scene.goal;
        card.append(title, summary);
        if (Array.isArray(scene.dialog)) {
            scene.dialog.forEach((turn) => {
                const turnEl = document.createElement("p");
                turnEl.innerHTML = `<strong>${capitalize(turn.speaker)}:</strong> ${turn.line}`;
                if (turn.translation) {
                    const meta = document.createElement("span");
                    meta.className = "appendix-meta";
                    meta.textContent = turn.translation;
                    turnEl.appendChild(document.createElement("br"));
                    turnEl.appendChild(meta);
                }
                card.appendChild(turnEl);
            });
        }
        container.appendChild(card);
    });
}

function renderPatterns(data) {
    const container = appendixBodyEls.patterns;
    if (!container) {
        return;
    }
    container.innerHTML = "";
    const patterns = data && Array.isArray(data.patterns) ? data.patterns : [];
    if (patterns.length === 0) {
        setAppendixStatus("patterns", "No patterns provided for this level.");
        return;
    }
    setAppendixStatus("patterns", `Loaded ${patterns.length} pattern(s).`);
    patterns.forEach((pattern) => {
        const card = document.createElement("div");
        card.className = "appendix-card";
        const title = document.createElement("h4");
        title.textContent = pattern.title;
        const structure = document.createElement("p");
        structure.className = "appendix-meta";
        structure.textContent = pattern.structure;
        card.append(title, structure);
        if (Array.isArray(pattern.examples)) {
            pattern.examples.forEach((example) => {
                const exampleEl = document.createElement("p");
                exampleEl.innerHTML = `<strong>${example.sentence}</strong><br>${example.translation}`;
                card.appendChild(exampleEl);
            });
        }
        if (Array.isArray(pattern.tips)) {
            const list = document.createElement("ul");
            pattern.tips.forEach((tip) => {
                const li = document.createElement("li");
                li.textContent = tip;
                list.appendChild(li);
            });
            card.appendChild(list);
        }
        container.appendChild(card);
    });
}

function setAppendixStatus(panel, message, { busy = false, error = false } = {}) {
    const el = appendixStatusEls[panel];
    if (!el) {
        return;
    }
    el.textContent = message;
    el.dataset.busy = busy ? "true" : "false";
    el.classList.toggle("is-error", !!error);
}

function clearAppendixBodies() {
    Object.values(appendixBodyEls).forEach((container) => {
        if (container) {
            container.innerHTML = "";
        }
    });
}

function clearAppendixPanels() {
    clearAppendixBodies();
    Object.keys(appendixStatusEls).forEach((key) => {
        setAppendixStatus(key, "Select a language and level.");
    });
}

function capitalize(value = "") {
    if (!value) {
        return "";
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
}
