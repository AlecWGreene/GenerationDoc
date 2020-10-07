import Language from "./models/language";
import * as languages from "./languages";

/**
 * Represents a scraper which will be used to parse files into nodes
 */
export default class CodeScraper {
    language: Language

    constructor(language: Language, settings: { include?: { functions?: Boolean, properties?: Boolean, classes?: Boolean} }) {
        this.language = language;
    }
}