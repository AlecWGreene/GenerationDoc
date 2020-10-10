import Language from "../models/language";

describe("Testing model: Language", () => {
    let lang: Language;
    beforeAll(()=>{
        let data = {
            identifierRule: /\w+/,
            types: ["float","string", "void"],
            qualifiers: ["static"],
            argumentPatterns: {
                "standard": /\(\s*(?:\w+,\s*)*\w+\s*\)/gmi
            },
            signatures: {
                "function": `public << ?qualifier#qualifier#>><<type#type#>> <<identifier#name#>><<arguments_standard#arguments#>>{`,
                "variable": `<<type#type#>><<identifier#name#>>=`
            }
        }
        lang = new Language("testLang",data.identifierRule, data.types, data.qualifiers, data.argumentPatterns, data.signatures);
    });

    describe("Constructor", () => {
        test("stores identifier rule correctly", () => {
            expect(lang.identifierRule).toEqual("\\w+");
        });
        test("stores argument patterns correctly", () => {
            expect(lang.argumentPatterns?.standard).toEqual("\\(\\s*(?:\\w+,\\s*)*\\w+\\s*\\)");
        });
    });

    describe("Parses Hancock expressions", () => {
        
        test("successfully for example function expression", () => {
            expect(lang.parseHancockExpression(lang.signatures.function)).toEqual(/(?<=[\n\r;]|^)\s*public\s+(?<qualifier>(?:static\s+))?(?<type>(?:float|string|void))\s+(?<name>(?:\w+))\s*(?<arguments>(?:\(\s*(?:\w+,\s*)*\w+\s*\)))\s*{/m);
        });

        test("successfully for example variable expression", () => {
            expect(lang.parseHancockExpression(lang.signatures.variable)).toEqual(/(?<=[\n\r;]|^)\s*(?<type>(?:float|string|void))\s*(?<name>(?:\w+))\s*=\s*/m);
        });
    });

    describe("Initializes expressions correctly", () => {
        
        test("for function example", () => {
            expect(lang.expressions.function).toEqual(/(?<=[\n\r;]|^)\s*public\s+(?<qualifier>(?:static\s+))?(?<type>(?:float|string|void))\s+(?<name>(?:\w+))\s*(?<arguments>(?:\(\s*(?:\w+,\s*)*\w+\s*\)))\s*{/m);
        });

        test("for variable example", () => {
            expect(lang.expressions.variable).toEqual(/(?<=[\n\r;]|^)\s*(?<type>(?:float|string|void))\s*(?<name>(?:\w+))\s*=\s*/m);
        });
    });
});