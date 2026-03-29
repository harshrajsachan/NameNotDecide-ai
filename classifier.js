const GOOD = {
    "tutorial": 4,
    "course": 5,
    "lecture": 4,
    "coding": 3,
    "math": 3,
    "algorithm": 4,
    "data structure": 5,
    "programming": 4,
    "development": 3
};

const BAD = {
    "prank": -5,
    "meme": -4,
    "roast": -4,
    "vlog": -3,
    "reaction": -5,
    "challenge": -4,
    "crazy": -3,
    "funny": -3
};

const CLICKBAIT = [
    "you won't believe",
    "shocking",
    "gone wrong",
    "must watch",
    "this will blow your mind",
    "insane result"
];

// STRONG distraction patterns
const TIMEWASTE_PATTERNS = [
    "24 hours",
    "last to leave",
    "vs",
    "challenge",
    "experiment"
];

function classify(text) {
    text = text.toLowerCase();

    let score = 0;
    let matches = 0;

    // GOOD scoring
    for (let word in GOOD) {
        if (text.includes(word)) {
            score += GOOD[word];
            matches++;
        }
    }

    // BAD scoring
    for (let word in BAD) {
        if (text.includes(word)) {
            score += BAD[word];
            matches++;
        }
    }

    // Clickbait penalty
    CLICKBAIT.forEach(p => {
        if (text.includes(p)) {
            score -= 4;
            matches++;
        }
    });

    // Time-waste patterns (very strong penalty)
    TIMEWASTE_PATTERNS.forEach(p => {
        if (text.includes(p)) {
            score -= 5;
            matches++;
        }
    });

    // Length factor (avoid short-text misclassification)
    const lengthFactor = Math.min(text.length / 120, 1);

    // Confidence calculation
    const confidence = matches * lengthFactor;

    return {
        score,
        confidence,
        matches
    };
}

// smarter decision
function shouldBlur(result) {
    const { score, confidence } = result;

    // low confidence → ignore
    if (confidence < 0.6) return false;

    // strong negative → blur
    if (score < -2) return true;

    return false;
}