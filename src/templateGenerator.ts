// Load dependencies
import { Language } from "./classes/language"; 

// Create language instance
const js_accessors: String[] = [];
const js_qualifiers: String[] = ["static", "async"];
const js_types: String[] = ["var", "const", "let"];
const js_tokens: String[] = ["function", "class"];
const js_identifierRule: String = "\[A-Za-z\_\$\]\[\\w\+\_\$\]\*";
const js_argumentPatterns: String[][] = [
                                      ["standard", "\\(\(\?\:\(\?\:<<argument_identifier>>\,\\s\*\)\*<<argument_identifier>>\\s\*\)\?\\)"],
                                      ["anonymous", "\(\?\:\\(\(\?\:\(\?\:<<argument_identifier>>\,\\s\*\)\*<<argument_identifier>>\\s\*\)\?\\)\)|<<argument_identifier>>\\s\*"]
                                    ];
const js_signatures: String[][] = [
                              ["standard","\(\?\:<<qualifier>>\\s+\)\?\(\?\:<<token>>\\s\+\)\?<<identifier>>\\s\*\(\?\<standard_arguments\><<argument_pattern_standard>>\)\\s\*"],
                              ["prototype","<<parent>>\\.prototype\\.<<identifier>>\\s\*\=\\s\*\(\?\:<<qualifier>>\\s\)\?\\s\*\(\?\<prototype_token\>function\\s\*\)\?\\s\*\(\?\<prototype_arguments\><<argument_pattern_standard>>\)\\s\*"],
                              ["anonymous_function","<<type>>\\s\*<<identifier>>\\s\*\=\(\?\:<<qualifier>>\\s\)\?\\s\*\(\?\<anonymous_function_token\>function\)\\s*\(\?\<anonymous_function_arguments\><<argument_pattern_anonymous>>\)\\s\*"],
                              ["property","\\s+<<parent>>\\.<<identifier>>\\s\*\=\\s\*\(\?\:<<qualifier>>\\s\)\?\(\?\<property_token\>function\\s\*\)\?\(\?\<property_arguments\><<argument_pattern_anonymous>>\)"],
                              ["anonymous_arrow_function", "\(\?\:\(\?\:<<parent>>\(\?\:\\.|\\.prototype\\.\)\)|<<type>>\\s\*\)<<identifier>>\\s\*\=\\s\*\(\?\:<<qualifier>>\\s+\)\?\(\?\<anonymous_arrow_function_arguments\><<argument_pattern_anonymous>>\)\\s\*\=\>"]
                             ];

let javascript = new Language("JavaScript", js_accessors, js_qualifiers, js_tokens, js_types, js_signatures, js_argumentPatterns, js_identifierRule);

export { javascript as jsTemplate }