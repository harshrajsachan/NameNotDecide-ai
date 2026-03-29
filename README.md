# BlurMind (Chrome Extension, Manifest V3)

BlurMind is a client-side focus assistant that removes distracting content in real time and reshapes platforms like YouTube into a productivity-first environment.

Instead of just blurring content, BlurMind intelligently filters and removes low-value content using a hybrid AI + rule-based system.

---

## 🚀 Features

### 🎯 Smart Content Filtering

* Uses a hybrid classifier (keywords + similarity scoring)
* Detects distracting vs educational content
* Removes low-value content directly from the DOM

### 🎓 Study Mode

* Strict filtering mode
* Only allows educational content (tutorials, lectures, coding, etc.)
* Removes entertainment, clickbait, and fake educational videos

### 📺 YouTube Optimization

* Removes Shorts completely from:

  * Homepage
  * Sidebar
  * Search results (unless relevant)
* Filters video feed based on content quality
* Keeps only useful learning-focused videos

### 📊 Focus Feedback UI

* Live counter of removed distractions
* Progress bar showing focus level
* Real-time feedback loop to reinforce productivity

### ⚡ Real-Time Processing

* Works dynamically as content loads
* Uses MutationObserver + interval fallback
* Fully client-side (no API calls)

---

## 🧠 How It Works

BlurMind uses a hybrid system:

1. **Keyword Scoring**

   * Positive (tutorial, course, coding, etc.)
   * Negative (meme, prank, reaction, etc.)

2. **Clickbait Detection**

   * Detects phrases like:

     * "you won't believe"
     * "try not to laugh"
     * "gone wrong"

3. **Similarity Matching**

   * Compares content against:

     * Educational samples
     * Distracting samples

4. **Final Decision**

   * Generates a score + confidence
   * Removes content if classified as distraction

---

## 📁 Project Structure

* `manifest.json` — Chrome Extension (MV3) configuration
* `background.js` — handles extension lifecycle
* `content.js` — main engine (DOM filtering + YouTube logic + UI overlay)
* `classifier.js` — hybrid AI classifier
* `popup/` — toggle UI

---

## 🛠️ Load Locally

1. Open:
   chrome://extensions

2. Enable:
   Developer Mode

3. Click:
   Load unpacked

4. Select your project folder:
   BlurMind/

---

## 🔘 Toggle

Click the extension icon to enable/disable BlurMind.

State is stored using:
chrome.storage.local

---

## ⚙️ Modes

### Study Mode (default: ON)

* Strict filtering
* Only educational content allowed

### Normal Mode

* Balanced filtering
* Removes obvious distractions

---

## 🧭 Vision

BlurMind is not just a filter.

It is an **attention control system** designed to:

* Reduce dopamine-driven scrolling
* Promote deep work
* Turn distracting platforms into learning tools

---

## 🔥 Future Improvements

* User-trained model (learn from clicks)
* Whitelist / blacklist UI
* Time saved analytics
* Focus streak system
* Platform-specific optimization (YouTube, Instagram, etc.)

---
