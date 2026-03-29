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

    // Remove Shorts shelf
    document.querySelectorAll("ytd-reel-shelf-renderer").forEach(removeElement);

    // Remove Shorts sidebar items
    document.querySelectorAll("ytd-reel-item-renderer").forEach(removeElement);

    // Remove any Shorts links
    document.querySelectorAll('a[href*="/shorts/"]').forEach(link => {
        const container = link.closest(
            "ytd-video-renderer, ytd-rich-item-renderer, ytd-compact-video-renderer"
        );
        if (container) removeElement(container);
    });

    // Remove sections containing "Shorts"
    document.querySelectorAll("ytd-rich-section-renderer").forEach(section => {
        if (section.innerText.toLowerCase().includes("shorts")) {
            removeElement(section);
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