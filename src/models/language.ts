class Language {
    name: string
    identifierRule: string
    types: string[]
    qualifiers: string[]
    argumentPatterns: { [key: string]: string}
    signatures: { [key: string]: string}

    expressions: { [key: string]: RegExp}    

    constructor(name: string, identifierRule: RegExp | string, types: string[], qualifiers: string[], argumentPatterns: { [key: string]: string | RegExp}, signatures: { [key: string]: string}){
        this.name = name;
        this.identifierRule = (typeof(identifierRule) === "string") ? identifierRule : identifierRule.toString().replace(/\//g,"");
        this.types = types;
        this.qualifiers = qualifiers;
        this.signatures = signatures;

        this.expressions = {}

        // Stringify all RegExp entries
        this.argumentPatterns = {};
        for (const entry of Object.entries(argumentPatterns)) {
            if (typeof(entry[1]) === "string") {
                this.argumentPatterns[entry[0]] = entry[1];
            }
            else {
                this.argumentPatterns[entry[0]] = entry[1].toString().replace(/\/\w+$/,"").replace(/\//g,"");
            }
        }

        // Parse signatures into this.expressions
        for(let sign of Object.entries(signatures)){
            this.expressions[sign[0]] = this.parseHancockExpression(sign[1]);
        }
    }

    /**
     * Transforms a Hancock expression into a Regular Expression using the language's features 
     */
    parseHancockExpression(expression: string): RegExp{
        // Replace Identifier, type, and qualifier tokens
        let exp = expression.replace(/\<\<(?<space>\s)?(?<star>\*)?(?<conditional>\?)?identifier\#(?<token_name>[\w\_]+)\#\>\>/g,`\(\?\<$<token_name>\>\(\?\:${this.identifierRule}$<space>\)$<star>\)$<conditional>`);
        exp = exp.replace(/\<\<(?<space>\s)?(?<star>\*)?(?<conditional>\?)?type\#(?<token_name>[\w\_]+)\#\>\>/g,`\(\?\<$<token_name>\>\(\?\:${this.types.join("$<space>|")}$<space>\)$<star>\)$<conditional>`);
        exp = exp.replace(/\<\<(?<space>\s)?(?<star>\*)?(?<conditional>\?)?qualifier\#(?<token_name>[\w\_]+)\#\>\>/g,`\(\?\<$<token_name>\>\(\?\:${this.qualifiers.join("$<space>|")}$<space>\)$<star>\)$<conditional>`);

        // Replace argument tokens
        for (const pattern of Object.entries(this.argumentPatterns)) {
            exp = exp.replace(new RegExp(`\\<\\<(?<space>\\s)?(?<star>\\*)?(?<conditional>\\?)?arguments_${pattern[0]}\\#(?<token_name>[\\w\\_]+)\\#\\>\\>`,"g"),`\(\?\<$<token_name>\>\(\?\:${pattern[1]}$<space>\)$<star>\)$<conditional>`);
        }

        // Replace anonymous tokens
        exp = exp.replace(/\<\<(?<space>\s)?(?<star>\*)?(?<conditional>\?)?identifier\>\>/g,`\(\?\:\(\?\:${this.identifierRule}$<space>\)$<star>\)$<conditional>`);
        exp = exp.replace(/\<\<(?<space>\s)?(?<star>\*)?(?<conditional>\?)?type\>\>/g,`\(\?\:\(\?\:${this.types.join("$<space>|")}$<space>\)$<star>\)$<conditional>`);
        exp = exp.replace(/\<\<(?<space>\s)?(?<star>\*)?(?<conditional>\?)?qualifier\>\>/g,`\(\?\:\(\?\:${this.qualifiers.join("$<space>|")}$<space>\)$<star>\)$<conditional>`);

        // Replace spaces with \s+ and )( with )\s*(
        exp = exp.replace(/ /g,"\\s+");
        exp = exp.replace(/\)\(/g, ")\\s*(");
        exp = exp.replace(/{/g, "\\s*{");
        exp = exp.replace(/=/g, "\\s*=\\s*");
        exp = exp.replace(/=>/g, "\\s*=>\\s*");
        return new RegExp(exp, "m");
    }

}

export default Language;