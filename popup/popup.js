const btn = document.getElementById("toggle");

chrome.storage.local.get(["enabled"], (data) => {
    let enabled = data.enabled ?? true;
    updateButton(enabled);

    btn.onclick = () => {
        enabled = !enabled;
        chrome.storage.local.set({ enabled });
        updateButton(enabled);
    };
});

function updateButton(state) {
    btn.innerText = state ? "ON 🟢" : "OFF 🔴";
}