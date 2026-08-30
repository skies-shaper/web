export const ADJECTIVES = {
    A: ["Astute", "Audacious", "Awesome", "Almighty"],
    B: ["Brisk", "Boisterous", "Bubbly", "Boastful"],
    C: ["Cantankerous", "Candid", "Comical"],
    D: ["Dapper", "Dangerous", "Droll"],
    E: ["Elegant", "Elusive", "Erratic"],
    F: ["Frivolous", "Frisky", "Furious"],
    G: ["Garrulous", "Gregarious", "Guileless"],
    H: ["Hyper", "Humble", "Heedless"],
    I: ["Inquisitive", "Industrial", "Impish"],
    J: ["Jovial", "Jumpy", "Jaunty"],
    K: ["Keen", "Kooky", "Killer"],
    L: ["Lethargic", "Lively", "Loquacious"],
    M: ["Mercurial", "Meticulous", "Morbid"],
    N: ["Nimble", "Normal", "Nonchalant"],
    O: ["Opinionated", "Obtuse", "Overzealous"],
    P: ["Pugnacious", "Patient", "Pedantic"],
    Q: ["Queer", "Quirky", "Quick"],
    R: ["Ravenous", "Resilient", "Rustic"],
    S: ["Swift", "Scheming", "Stolid"],
    T: ["Taciturn", "Tenacious", "Transcendent"],
    U: ["Utter", "Unsafe", "Ungainly"],
    V: ["Vibrant", "Vague", "Volatile"],
    W: ["Wily", "Whimsical", "Witty"],
    X: ["Xenial"],
    Y: ["Youthful", "Yawning", "Yearning"],
    Z: ["Zesty", "Zealous", "Zany", "Zen"]
};

export const ANIMALS = {
    A: ["Axolotl", "Anteater", "Alligator"],
    B: ["Bear", "Bunny", "Beaver"],
    C: ["Capybara", "Chameleon", "Cat"],
    D: ["Dog", "Dugong", "Dolphin"],
    E: ["Echidna", "Elephant", "Eagle"],
    F: ["Fox", "Flamingo", "Fennec"],
    G: ["Gorilla", "Giraffe", "Guanaco"],
    H: ["Hippo", "Horse", "Hyrax"],
    I: ["Ibex", "Iguana", "Impala"],
    J: ["Jaguar", "Jellyfish", "Jerboa"],
    K: ["Koala", "Kangaroo", "Kinkajou"],
    L: ["Lemur", "Llama", "Lion"],
    M: ["Manatee", "Meerkat", "Monkey"],
    N: ["Narwhal", "Numbat", "Newt"],
    O: ["Ocelot", "Octopus", "Owl"],
    P: ["Pangolin", "Platypus", "Penguin", "Pig"],
    Q: ["Quokka", "Quoll", "Quail"],
    R: ["Raccoon", "Rabbit", "Rhino"],
    S: ["Shark", "Sloth", "Squirrel"],
    T: ["Tapir", "Tiger", "Toucan"],
    U: ["Urchin", "Uguisu"],
    V: ["Viper", "Vulture"],
    W: ["Wombat", "Walrus", "Wolf"],
    X: ["Xerus", "Xiphias"],
    Y: ["Yak", "Yuhina"],
    Z: ["Zebra", "Zorilla", "Zebu"]
};

export function randomUsername() {
    const letter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(Math.floor(Math.random() * 26));
    const adjective = ADJECTIVES[letter][Math.floor(Math.random() * ADJECTIVES[letter].length)];
    const animal = ANIMALS[letter][Math.floor(Math.random() * ANIMALS[letter].length)];

    return adjective + " " + animal;
}