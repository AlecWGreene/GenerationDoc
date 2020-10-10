import Language from "../models/language";

// JavaScript breakdown
const identifierRule = /[A-Za-z\$\_][\w\$\_]*/
const types: string[] = ["const", "let", "var"];
const qualifiers: string[] = ["static", "async"];
const argumentPatterns = {
    "standard": /\((?:\s*(?:<<identifier>>\s*,\s*)*<<identifier>>\s*)?\)/,
    "arrow": /(?:\((?:\s*(?:<<identifier>>\s*,\s*)*<<identifier>>\s*)?\))|(?:\s*<<identifier>>\s*)/
};
const signatures = {
    "function_standard": `<< *?qualifier#qualifiers#>>function <<identifier#name#>><<arguments_standard#arguments#>>{`,
    "function_anonymous": `<<type#type#>> <<identifier#name#>>=<< *?qualifier#qualifiers#>>function(<<arguments_standard#arguments#>>){`,
    "function_anonymous_arrow": `<<type#type#>> <<identifier#name#>>=<< *?qualifier#qualifiers#>><<arguments_arrow#arguments#>>=>{?`,

    "class_standard": `class <<identifier#name#>>{`,
    "class_extends": `class <<identifier#name#>> extends <<identifier#parent#>>{`,

    "class_method": `<< *?qualifier#qualifiers#>><<identifier#name#>>(<<arguments_standard#arguments#>>){`,

    "class_prototype_function_anonymous": `<<identifier#parent#>>.prototype.<<identifier#name#>>=<< *?qualifier#qualifiers#>>function(<<arguments_standard#arguments#>>){`,
    "class_prototype_function_anonymous_arrow": `<<identifier#parent#>>.prototype.<<identifier#name#>>=<< *?qualifier#qualifiers#>><<arguments_arrow#arguments#>>=>{?`,

    "class_static_function_anonymous": `<<identifier#parent#>>.<<identifier#name#>>=<< *?qualifier#qualifiers#>>function(<<arguments_standard#arguments#>>){`,
    "class_static_function_anonymous_arrow": `<<identifier#parent#>>.<<identifier#name#>>=<< *?qualifier#qualifiers#>><<arguments_arrow#arguments#>>=>{?`,

    "class_property_standard": `this.<<identifier#name#>>=`,
    "class_property_static": `<<identifier#parent#>>.<<identifier#name#>>=`,
    "class_property_prototype": `<<identifier#parent#>>.prototype.<<identifier#name#>>=`,   
};

const javascript = new Language("JavaScript",identifierRule,types,qualifiers,argumentPatterns,signatures);

export default javascript;