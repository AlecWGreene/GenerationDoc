import { sign } from "crypto";
// Load dependencies
import { Language } from "./classes/language";
import { TreeNode } from "./classes/treenode";
import { jsTemplate } from "./templateGenerator";

class Token {
    language: Language;
    parent: String;
    identifier: String;
    accessor: String;
    qualifiers: String[];
    token: String;
    type: String;
    signature: String;
    arguments: String;

    constructor(language: Language, data: any) {
        this.parent = data?.parent;
        this.identifier = data?.identifier;
        this.accessor = data?.accessor;
        this.qualifiers = data?.qualifiers;
        this.token = data?.token;
        this.type = data?.type;
        this.signature = data?.signature;
        this.arguments = data?.arguments;
        this.language = language;
    }
    
}

class CodeScraper{
    // Properties
    private static defaultCharSet: String = "\\s\\w=;/\\.\+\-\^\(\)\&\|,\\[\\]\"\'\`\:\!\\<\\>\?\$";
    static charSet: String = "\\s\\w=;/\\.\+\-\^\(\)\&\|,\\[\\]\"\'\`\:\!\\<\\>\?\$";
    language: Language;
    leafTokenRegex: RegExp
    argumentPattern: String
    $asdf:any
    constructor(language: Language) {
        this.language = language;
        this.argumentPattern = "";
        this.leafTokenRegex = this.generateRegExp_LeafToken();
    }

    generateRegExp_LeafToken(): RegExp {
        // Assemble 
        const identifierPattern = this.language.identifierRule + "\\b";
        const accessorPattern = this.language.accessors.map(pattern => {
            return "\\s*" + pattern + "\\s*";
        }).join("|");
        const qualifierPattern = this.language.qualifiers.map(pattern => {
            return "\\s*" + pattern + "\\s*";
        }).join("|");
        const tokenPattern = this.language.tokens.map(pattern => {
            return "\\s*" + pattern + "\\s*";
        }).join("|");
        const typePattern = this.language.types.map(pattern => {
            return "\\s*" + pattern + "\\s*";
        }).join("|");

        let expression: any[] = [];

        // Create RegExp strings for each signature
        for (let signEntry of this.language.signatures) {
            let signName = signEntry[0];
            let sign = signEntry[1];
            sign = sign.replace(/\<\<type\>\>/gm, `\(\?\<${signName}_type\>` + typePattern + "\)");
            sign = sign.replace(/\<\<token\>\>/gm, `\(\?\<${signName}_token\>` + tokenPattern + "\)");
            sign = sign.replace(/\<\<qualifier\>\>/gm,`\(\?\<${signName}_qualifiers\>` + qualifierPattern + "\)");
            sign = sign.replace(/\<\<parent\>\>/gm,`\(\?\<${signName}_parent\>` + "\(\?\:\\s|\\.\)\?" + identifierPattern + "\)");
            sign = sign.replace(/\<\<identifier\>\>/gm,`\(\?\<${signName}_identifier\>` + "\(\?\:\\s|\\.\)\?" + identifierPattern + "\)");
            expression.push(`\(\?\<${signName}\>` + sign + "\)");
        }

        // Replace all argument placeholders
        for (let pattern of this.language.argumentPatterns) {
            // Iterate over all generated signatures
            for(let i = 0; i < expression.length; i++) {
                expression[i] = expression[i].replace(`\<\<argument_pattern_${pattern[0]}\>\>`, "\(\?\:" + pattern[1] + "\)");
                expression[i] = expression[i].replace(new RegExp(`\<\<argument_identifier\>\>\\b`,"gm"), "\(\?\:\\s|\\.\\.\\.\)\?" + identifierPattern + "\\b");
                expression[i] = expression[i].replace(new RegExp(`\<\<argument_identifier\>\>`,"gm"), "\(\?\:\\s|\\.\\.\\.\)\?" + identifierPattern + "\\b");
            }
        }

        return new RegExp(expression.join("|").toString(), "m");
    }

    performFunctionSearch(text: String): Token {
        let match = text.match(this.leafTokenRegex);
        return this.tokenize(match);
    }

    tokenize(match?: any): Token{
        let sig: String;
        let data: {[key: string]: any} = {}
        checkSignature:
        for (let signature of this.language.signatures) {
            if (match?.groups[signature[0].toString()] !== undefined) {
                sig = signature[0].toString();
                data.signature = sig;
                for (let entry of Object.entries(match?.groups)) {
                    if (entry[1] !== undefined) {
                        let entryName = entry[0].replace(sig.toString() + "_", "");
                        data[entryName] = entry[1];
                    }
                }
                break checkSignature;
            }
        }

        return new Token(jsTemplate, data);
    }
}

export { CodeScraper } 