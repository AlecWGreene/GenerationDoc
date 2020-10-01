// Load dependencies
import { Language } from "../classes/language";
import * as templates from "../templateGenerator";

describe("When class Language", () => {
    describe("Is instantiated as Javascript", () => {

        // Double check instantiation
        test("Has no accessors", () => {
            expect(templates.jsTemplate.accessors).toHaveLength(0);    
        });

        describe("Has the qualifiers", () => {
            test("static and async", () => {
                expect(templates.jsTemplate.qualifiers).toContain("static");
                expect(templates.jsTemplate.qualifiers).toContain("async");
            });

            test("exclusively", () => {
                expect(templates.jsTemplate.qualifiers).toHaveLength(2);
            });
        });

        describe("Has tokens for", () => {
            test("function and class", () => {
                expect(templates.jsTemplate.tokens).toContain("function");
                expect(templates.jsTemplate.tokens).toContain("class");
            });

            test("exclusively", () => {
                expect(templates.jsTemplate.tokens).toHaveLength(2);
            });
        });

        describe("Has the types", () => {
            test("var, let, and const", () => {
                expect(templates.jsTemplate.types).toContain("var");
                expect(templates.jsTemplate.types).toContain("let");
                expect(templates.jsTemplate.types).toContain("const");
            });

            test("exclusively", () => {
                expect(templates.jsTemplate.types).toHaveLength(3);
            });
        });

        describe("Has the identifier pattern", () => {
            test("arg_variable2 is valid", () => {
                expect("arg_variable2".match(new RegExp("\\b" + templates.jsTemplate.identifierRule.toString()+ "\\b"))?.length ).toBeDefined();
            });
            test("2var is not valid", () => {
                expect("2var".match(new RegExp("\\b" +templates.jsTemplate.identifierRule.toString()+ "\\b"))?.length).not.toBeDefined();
            });

            test("_$ is a valid identifier", () => {
                expect("_$".match(new RegExp("\\b" +templates.jsTemplate.identifierRule.toString()+ "\\b"))?.length).toBeDefined();
            });

            test("arg.value is not a valid identifier", () => {
                expect("arg.value".match(new RegExp("\\b" + templates.jsTemplate.identifierRule.toString()+ "\\b"))?.length ).toEqual(1);
            });
        });

        describe("Has the argument patterns", () => {
            test("standard", () => {
                expect(templates.jsTemplate.argumentPatterns.map(arr => arr[0])).toContain("standard");
            });
            test("anonymous", () => {
                expect(templates.jsTemplate.argumentPatterns.map(arr => arr[0])).toContain("anonymous");
            });

            test("exclusively", () => {
                expect(templates.jsTemplate.argumentPatterns).toHaveLength(2);
            });
        });

        describe("Has the signatures", () => {
            test("standard", () => {
                expect(templates.jsTemplate.signatures.map(arr => arr[0])).toContain("standard");
            });
            test("prototype", () => {
                expect(templates.jsTemplate.signatures.map(arr => arr[0])).toContain("prototype");
            });
            test("anonymous function", () => {
                expect(templates.jsTemplate.signatures.map(arr => arr[0])).toContain("anonymous_function");
            });
            test("property", () => {
                expect(templates.jsTemplate.signatures.map(arr => arr[0])).toContain("property");
            });
            test("anonymous arrow function", () => {
                expect(templates.jsTemplate.signatures.map(arr => arr[0])).toContain("anonymous_arrow_function");
            });

            test("exclusively", () => {
                expect(templates.jsTemplate.signatures).toHaveLength(5);
            });
        });
    });
});