export function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

// make trivial latin square using cycles; randomly permute rows, cols, and symbols
export function randomLatinSquare(n) {
    const rowPerm = shuffle(Array.from({ length: n }, (_, i) => i));
    const colPerm = shuffle(Array.from({ length: n }, (_, i) => i));
    const symbolPerm = shuffle(Array.from({ length: n }, (_, i) => i));

    const square = [];

    for (let i = 0; i < n; i++) {
        const row = [];

        for (let j = 0; j < n; j++) {
            const baseSymbol = (rowPerm[i] + colPerm[j]) % n;
            row.push(symbolPerm[baseSymbol]);
        }

        square.push(row);
    }

    return square;
}