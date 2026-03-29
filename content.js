// ===== REMOVE ELEMENT =====
function removeElement(el) {
    if (!el || el.dataset.blurmindRemoved) return;

    el.remove();
    el.dataset.blurmindRemoved = "true";
}

// ===== DETECT YOUTUBE =====
function isYouTube() {
    return window.location.hostname.includes("youtube.com");
}

// ===== REMOVE SHORTS (GLOBAL) =====
function removeShorts() {

    // ===== 1. Remove Shorts shelf (homepage)
    document.querySelectorAll("ytd-reel-shelf-renderer")
        .forEach(removeElement);

    // ===== 2. Remove Shorts sidebar (watch page)
    document.querySelectorAll("ytd-reel-item-renderer")
        .forEach(removeElement);

    // ===== 3. Remove ANY video that links to /shorts/
    document.querySelectorAll('a[href*="/shorts/"]').forEach(link => {
        const container = link.closest(
            "ytd-video-renderer, ytd-rich-item-renderer, ytd-compact-video-renderer"
        );
        if (container) removeElement(container);
    });

    // ===== 4. Sidebar (compact videos)
    document.querySelectorAll("ytd-compact-video-renderer").forEach(el => {
        const link = el.querySelector('a[href*="/shorts/"]');
        if (link) removeElement(el);
    });

    // ===== 5. Search results (main fix 🔥)
    document.querySelectorAll("ytd-video-renderer").forEach(video => {
        const link = video.querySelector('a[href*="/shorts/"]');
        if (link) removeElement(video);
    });

    // ===== 6. Section-based removal
    document.querySelectorAll("ytd-rich-section-renderer").forEach(section => {
        if (section.innerText.toLowerCase().includes("shorts")) {
            removeElement(section);
        }
    });

    // ===== 7. Ultra fallback (text-based detection)
    document.querySelectorAll("*").forEach(el => {
        if (
            el.children.length === 0 &&
            el.innerText &&
            el.innerText.trim().toLowerCase() === "shorts"
        ) {
            el.parentElement?.remove();
        }
    });
}

// ===== PROCESS YOUTUBE VIDEOS =====
function processYouTube() {
    const videos = document.querySelectorAll(
        "ytd-rich-item-renderer, ytd-video-renderer"
    );

    videos.forEach(video => {
        if (video.dataset.blurmindProcessed) return;

        const title = video.querySelector("#video-title")?.innerText || "";
        const channel = video.querySelector("#channel-name")?.innerText || "";

        const text = (title + " " + channel).toLowerCase();

        const result = classify(text);

        // Remove low-value content
        function shouldRemove(result) {
    if (result.confidence < 0.5) return false;
    return result.score < 0;
}

        video.dataset.blurmindProcessed = "true";
    });
}

// ===== MAIN =====
function main() {
    chrome.storage.local.get(["enabled"], (data) => {
        if (data.enabled === false) return;

        if (isYouTube()) {
            removeShorts();     // 🔥 kill all shorts
            processYouTube();   // filter videos
        }
    });
}

// ===== OBSERVER =====
const observer = new MutationObserver(main);

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// ===== INTERVAL BACKUP =====
setInterval(main, 1500);

// Initial run
main();