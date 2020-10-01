import { CodeScraper } from "../codeScraper";
import { jsTemplate } from "../templateGenerator";
import * as fs from "fs";

describe("Scraping the text from /test-data/gameSession.js", () => {
    const fileText = fs.readFileSync("test-data/gameSession.js","utf-8");
    const scraper = new CodeScraper(jsTemplate);
    test("Loads text into the variable", () => {
        expect(fileText).toBeDefined();
    })

    describe("Completes the following examples", () => {
        let examples: any[][] = [
            // Standard functions
            ["function testFn(arg1,arg_2, arg_3)", 
                {
                    parent: undefined,
                    identifier: "testFn",
                    accessor: undefined,
                    qualifiers: undefined,
                    token: "function",
                    type: undefined,
                    signature: "standard",
                    arguments: "(arg1,arg_2, arg_3)"
                }
            ],
            ["function testFn(arg1)", 
                {
                    parent: undefined,
                    identifier: "testFn",
                    accessor: undefined,
                    qualifiers: undefined,
                    token: "function",
                    type: undefined,
                    signature: "standard",
                    arguments: "(arg1)"
                }
            ],
            ["async function testFn(arg1, $arg_2, ...arg_3)", 
                {
                    parent: undefined,
                    identifier: "testFn",
                    accessor: undefined,
                    qualifiers: "async",
                    token: "function",
                    type: undefined,
                    signature: "standard",
                    arguments: "(arg1, $arg_2, ...arg_3)"
                }
            ],
            // Prototypes
            ["testClass.prototype.testFn = function(arg1, $arg_2, ...arg_3)", 
                {
                    parent: "testClass",
                    identifier: "testFn",
                    accessor: undefined,
                    qualifiers: undefined,
                    token: "function",
                    type: undefined,
                    signature: "prototype",
                    arguments: "(arg1, $arg_2, ...arg_3)"
                }
            ],
            ["testClass.prototype.testFn = (arg1, $arg_2, ...arg_3) =>", 
                {
                    parent: "testClass",
                    identifier: "testFn",
                    accessor: undefined,
                    qualifiers: undefined,
                    token: undefined,
                    type: undefined,
                    signature: "prototype",
                    arguments: "(arg1, $arg_2, ...arg_3)"
                }
            ],
            // Anonymous Functions
            ["const testFn = function(arg1, $arg_2, ...arg_3)", 
                {
                    parent: undefined,
                    identifier: "testFn",
                    accessor: undefined,
                    qualifiers: undefined,
                    token: "function",
                    type: "const",
                    signature: "anonymous_function",
                    arguments: "(arg1, $arg_2, ...arg_3)"
                }
            ],
            ["let testFn = function(arg1, $arg_2, ...arg_3)", 
                {
                    parent: undefined,
                    identifier: "testFn",
                    accessor: undefined,
                    qualifiers: undefined,
                    token: "function",
                    type: "let",
                    signature: "anonymous_function",
                    arguments: "(arg1, $arg_2, ...arg_3)"
                }
            ],
            ["var testFn = function(arg1, $arg_2, ...arg_3)", 
                {
                    parent: undefined,
                    identifier: "testFn",
                    accessor: undefined,
                    qualifiers: undefined,
                    token: "function",
                    type: "var",
                    signature: "anonymous_function",
                    arguments: "(arg1, $arg_2, ...arg_3)"
                }
            ],
            // Properties
            ["this.$test_Func = function(_a){}", 
                {
                    parent: "this",
                    identifier: "$test_Func",
                    accessor: undefined,
                    qualifiers: undefined,
                    token: undefined,
                    type: undefined,
                    signature: "properties",
                    arguments: "_a"
                }
            ],
            ["testClass._test_Func = function(_a, $arg2){}", 
                {
                    parent: "testClass",
                    identifier: "$test_Func",
                    accessor: undefined,
                    qualifiers: undefined,
                    token: undefined,
                    type: undefined,
                    signature: "properties",
                    arguments: "_a"
                }
            ],
            ["this.$test_Func = _a => {}", 
                {
                    parent: "this",
                    identifier: "$test_Func",
                    accessor: undefined,
                    qualifiers: undefined,
                    token: undefined,
                    type: undefined,
                    signature: "properties",
                    arguments: "_a"
                }
            ],
            ["testClass.$test_Func = (_a, $arg2) => {}", 
                {
                    parent: "testClass",
                    identifier: "$test_Func",
                    accessor: undefined,
                    qualifiers: undefined,
                    token: undefined,
                    type: undefined,
                    signature: "properties",
                    arguments: "_a"
                }
            ],
            ["this.$test_Func = _a => {}", 
                {
                    parent: "this",
                    identifier: "$test_Func",
                    accessor: undefined,
                    qualifiers: undefined,
                    token: undefined,
                    type: undefined,
                    signature: "properties",
                    arguments: "_a"
                }
            ],
            ["testClass.testFunc = () => {}", 
                {
                    parent: "testClass",
                    identifier: "testFunc",
                    accessor: undefined,
                    qualifiers: undefined,
                    token: undefined,
                    type: undefined,
                    signature: "properties",
                    arguments: "()"
                }
            ],
            // Anonymous Arrow Functions
            ["const $test_Func = _a => {}", 
                {
                    parent: undefined,
                    identifier: "$test_Func",
                    accessor: undefined,
                    qualifiers: undefined,
                    token: undefined,
                    type: "const",
                    signature: "anonymous_arrow_function",
                    arguments: "_a"
                }
            ]
        ];
        for(let ex of examples) {
            test(ex[0], () => {
                let matchToken = scraper.performFunctionSearch(ex[0]);

                expect(matchToken?.signature?.trim()).toEqual(ex[1].signature);                    
                expect(matchToken?.parent?.trim()).toEqual(ex[1].parent);
                expect(matchToken?.token?.trim()).toEqual(ex[1].token);
                expect(matchToken?.identifier?.trim()).toEqual(ex[1].identifier);
                expect(matchToken?.accessor?.trim()).toEqual(ex[1].accessor);
                expect(matchToken?.qualifiers).toEqual(ex[1].qualifiers);
                expect(matchToken?.type?.trim()).toEqual(ex[1].type);
                expect(matchToken?.arguments?.trim()).toEqual(ex[1].arguments);
            });
        }
    });

    test("CodeScraper assembles a Regular Expression", () => {
        expect(scraper.leafTokenRegex).toEqual(/\s*(class\s|function\s|\w+\.|const\s|let\s|var\s)?\s*((?:\w+\s*(?:\((?:\w*,\s*)*\w*\s*\))?)|(?:\w+\s*=\s*(?:\(?(?:\w*,\s*)*\w*\s*\)?)))\s*(?:(?:\s*=?\s*)|(?:\s*=>\s*))?{([\s\w=;/\.\+\-\^\(\)\&\|,\[\]\"\'\`:!\<\>\?]*)\s*}/gm)
    })
});