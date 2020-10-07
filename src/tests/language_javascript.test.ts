import javascript from "../languages/javascript";

describe("Testing language: JavaScript", () => {
    describe("Identifier pattern", () => {
        const cases: Array<Array<String|Boolean>> = [
            ["test", true],
            ["test_fn", true],
            ["1test", false],
            ["test$fn", true],
            ["$", true],
            ["/test", false],
            ["_test", true],
            ["$test_fn", true],
            ["test19", true],
            ["_$test19_01fn92", true],
            ["te\%st", false],
            ["test\&", false],
            ["te\>st\'\"", false]
        ];
        for(const c of cases) {
            test(`${c[1]?"matches":"doesn't match"} ${c[0]}`, () => {
                expect(c[0].toString().match(new RegExp("^" + javascript.identifierRule + "$")) !== null).toEqual(c[1]);
            });
        }
    });

    describe("Function signatures", () => {
        const cases = {
            standard: [
                ["function $test_Fn ( $arg , g_ar, arg ) {", {
                    name: "$test_Fn",
                    arguments: "( $arg , g_ar, arg )",
                    qualifiers: undefined
                }],
                ["async static function $test_Fn ( $arg , g_ar, arg ) {", {
                    name: "$test_Fn",
                    arguments: "( $arg , g_ar, arg )",
                    qualifiers: "async static "
                }]
            ],
            anonymous: [
                ["const $test_Fn = async static function($arg1, _arg2 , arg3 ){",{
                    name: "$test_Fn",
                    arguments: "($arg1, _arg2 , arg3 )",
                    qualifiers: "async static ",
                    type: "const"
                }],
                ["let $test_Fn=function(){",{
                    name: "$test_Fn",
                    arguments: "()",
                    qualifiers: undefined,
                    type: "let"
                }]
            ],
            arrow: [
                ["const $test_Fn = arg1 => {",{
                    name: "$test_Fn",
                    arguments: "arg1 ",
                    qualifiers: undefined,
                    type: "const"
                }],
                ["let _test$Fn = async (arg1 , arg2, arg3 ) => {",{
                    name: "_test$Fn",
                    arguments: "(arg1 , arg2, arg3 )",
                    qualifiers: "async ",
                    type: "let"
                }]
            ],
            class_prototype_arrow: [
                ["_test$Class.prototype.$test_Fn = arg1 => {",{
                    name: "$test_Fn",
                    arguments: "arg1 ",
                    qualifiers: undefined,
                    parent: "_test$Class"
                }],
                ["_test$Class.prototype._test$Fn = async (arg1 , arg2, arg3 ) => {",{
                    name: "_test$Fn",
                    arguments: "(arg1 , arg2, arg3 )",
                    qualifiers: "async ",
                    parent: "_test$Class"
                }]
            ],
            class_prototype: [
                ["_test$Class.prototype.$test_Fn = async static function($arg1, _arg2 , arg3 ){",{
                    name: "$test_Fn",
                    arguments: "($arg1, _arg2 , arg3 )",
                    qualifiers: "async static ",
                    parent: "_test$Class"
                }],
                ["_test$Class.prototype.$test_Fn=function(){",{
                    name: "$test_Fn",
                    arguments: "()",
                    qualifiers: undefined,
                    parent: "_test$Class"
                }]
            ],
            class_static: [
                ["_test$Class.$test_Fn = async static function($arg1, _arg2 , arg3 ){",{
                    name: "$test_Fn",
                    arguments: "($arg1, _arg2 , arg3 )",
                    qualifiers: "async static ",
                    parent: "_test$Class"
                }],
                ["_test$Class.$test_Fn=function(){",{
                    name: "$test_Fn",
                    arguments: "()",
                    qualifiers: undefined,
                    parent: "_test$Class"
                }]
            ],
            class_static_arrow: [
                ["_test$Class.$test_Fn = arg1 => {",{
                    name: "$test_Fn",
                    arguments: "arg1 ",
                    qualifiers: undefined,
                    parent: "_test$Class"
                }],
                ["_test$Class._test$Fn = async (arg1 , arg2, arg3 ) => {",{
                    name: "_test$Fn",
                    arguments: "(arg1 , arg2, arg3 )",
                    qualifiers: "async ",
                    parent: "_test$Class"
                }]
            ]
        }

        describe("standard", () => {
            for(let c of cases.standard) {
                test(`function: ${c[0]}`,() => {
                    const data: any = c[0].toString().match(javascript.expressions.function_standard);
                    expect(data?.groups).toEqual(c[1]);
                });
            }
        });

        describe("anonymous", () => {
            for(let c of cases.anonymous) {
                test(`function: ${c[0]}`,() => {
                    const data: any = c[0].toString().match(javascript.expressions.function_anonymous);
                    expect(data?.groups).toEqual(c[1]);
                });
            }
        });

        describe("arrow", () => {
            for(let c of cases.arrow) {
                test(`function: ${c[0]}`,() => {
                    const data: any = c[0].toString().match(javascript.expressions.function_anonymous_arrow);
                    expect(data?.groups).toEqual(c[1]);
                });
            }
        });

        describe("class prototype anonymous", () => {
            for(let c of cases.class_prototype) {
                test(`function: ${c[0]}`,() => {
                    const data: any = c[0].toString().match(javascript.expressions.class_prototype_function_anonymous);
                    expect(data?.groups).toEqual(c[1]);
                });
            }
        });

        describe("class prototype anonymous arrow", () => {
            for(let c of cases.class_prototype_arrow) {
                test(`function: ${c[0]}`,() => {
                    const data: any = c[0].toString().match(javascript.expressions.class_prototype_function_anonymous_arrow);
                    expect(data?.groups).toEqual(c[1]);
                });
            }
        });

        describe("class static anonymous", () => {
            for(let c of cases.class_static) {
                test(`function: ${c[0]}`,() => {
                    const data: any = c[0].toString().match(javascript.expressions.class_static_function_anonymous);
                    expect(data?.groups).toEqual(c[1]);
                });
            }
        });

        describe("class static anonymous arrow", () => {
            for(let c of cases.class_static_arrow) {
                test(`function: ${c[0]}`,() => {
                    const data: any = c[0].toString().match(javascript.expressions.class_static_function_anonymous_arrow);
                    expect(data?.groups).toEqual(c[1]);
                });
            }
        });
       
    });
})