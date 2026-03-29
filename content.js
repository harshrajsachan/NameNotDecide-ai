function applyBlur(el) {
    if (el.dataset.blurmindApplied) return;

    el.style.filter = "blur(6px)";
    el.style.pointerEvents = "none";

    const label = document.createElement("div");
    label.innerText = "BlurMind";
    label.style.position = "absolute";
    label.style.background = "black";
    label.style.color = "white";
    label.style.fontSize = "10px";
    label.style.zIndex = "9999";
    label.style.padding = "2px";

    el.style.position = "relative";
    el.appendChild(label);

    el.dataset.blurmindApplied = "true";
}

function processElement(el) {
    const text = el.innerText;

    if (!text || text.length < 30) return;

    const result = classify(text);

    if (shouldBlur(result)) {
        applyBlur(el);
    }
}

function scanPage() {
    chrome.storage.local.get(["enabled"], (data) => {
        if (data.enabled === false) return;

        const elements = document.querySelectorAll("a, p, span, h1, h2, h3");
        elements.forEach(processElement);
    });
}

// Initial run
scanPage();

// Dynamic content observer
const observer = new MutationObserver(scanPage);
observer.observe(document.body, {
    childList: true,
    subtree: true
});