const GOOD = {
    "tutorial": 3,
    "course": 4,
    "lecture": 3,
    "coding": 3,
    "math": 2,
    "algorithm": 3,
    "data structure": 4
};

const BAD = {
    "prank": -4,
    "meme": -3,
    "roast": -3,
    "vlog": -2,
    "reaction": -4,
    "challenge": -3,
    "crazy": -2
};

const CLICKBAIT = [
    "you won't believe",
    "shocking",
    "gone wrong",
    "must watch"
];

function classify(text) {
    text = text.toLowerCase();

    let score = 0;
    let matches = 0;

    for (let word in GOOD) {
        if (text.includes(word)) {
            score += GOOD[word];
            matches++;
        }
    }

    for (let word in BAD) {
        if (text.includes(word)) {
            score += BAD[word];
            matches++;
        }
    }

    CLICKBAIT.forEach(pattern => {
        if (text.includes(pattern)) {
            score -= 3;
            matches++;
        }
    });

    const lengthFactor = Math.min(text.length / 100, 1);
    const confidence = matches * lengthFactor;

    return { score, confidence };
}

function shouldBlur(result) {
    if (result.confidence < 0.5) return false;
    return result.score < 0;
}