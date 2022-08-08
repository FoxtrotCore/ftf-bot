export class ManifestNotGenerated extends Error {
    constructor() {
        super(`A manifest of all available episodes has not been generated yet!`);
    }
}