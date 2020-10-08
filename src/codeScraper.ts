import Language from "./models/language";
import * as languages from "./languages";

export class Node {
    parent: Node | undefined
    children: Node[]
    data: {
        parent?: string
        name?: string
        type?: string
        qualifiers?: string
        arguments?: string
        signature?: string
    }

    constructor(data: { [key: string]: string}, parent?: Node, children?: Node[]) {
        this.data = data;
        this.parent = parent;
        this.children = children === undefined ? [] : children;
        parent?.children.push(this);

        // Update child nodes' parent property to point to this
        for (const child of this.children) {
            if (child) {    
                child.parent = this;
            }
        }
    }

    setParent(node: Node | undefined): void{
        // Remove from parent's child list
        if(this.parent){
            this.parent.children = this.parent.children.filter(child => child !== this);
        }

        this.parent = node;
        node?.children.push(this);
    }
}

/**
 * Represents a scraper which will be used to parse files into nodes
 */
export default class CodeScraper {
    language: Language
    static leafExpression: RegExp = /(?<node_name>[\s\w\.\=\-\_\[\]\:\(\)\!\?\"\'\`\$\+\,\&\^\%\>\<\/\|]*){(?<node_body>[\s\w\.\=\-\_\[\]\:\(\)\!\?\"\'\`\$\+\,\&\^\%\>\<\/\|;\*\@\#]*)\s*}/gm
    static statementExpression: RegExp = /[^;\n\r]+(?=;|\n|\r|$)/gm

    constructor(language: Language, settings?: { include?: { functions?: Boolean, properties?: Boolean, classes?: Boolean} }) {
        this.language = language;
    }

    getLeafScopes(text: string): ( {[key: string]: string} | undefined)[] | undefined {
        // Find matches on a global regex search and then match each entry into its capturing groups
        const matches = text.match(CodeScraper.leafExpression);
        if(matches !== null && matches !== undefined) {
            return matches.map(m => m !== null ? 
                                    m.match(/(?<node_name>[\s\w\.\=\-\_\[\]\:\(\)\!\?\"\'\`\$\+\,\&\^\%\>\<\/\|]*){(?<node_body>[\s\w\.\=\-\_\[\]\:\(\)\!\?\"\'\`\$\+\,\&\^\%\>\<\/\|;\*\@\#]*)\s*}/m)?.groups 
                                    : undefined);
        }

        return undefined;
    }

    convertStatementToNode(text: string): Node | undefined {
        for (const signature of Object.entries(this.language.expressions)) {
            const match = text.match(new RegExp(signature[1]));
            if (match !== null && match.groups !== undefined) {
                const nodeData = match.groups;
                nodeData.signature = signature[0];
                return new Node(nodeData);
            }
        }

        return undefined;
    }

    parseScope(text: string): Node[] {
        let nodeArray: Node[] = [];
        
        // Iteratre through statements and convert to node
        const matches = text.match(CodeScraper.statementExpression);
        if(matches !== null){
            for (const match of matches) {
                const node = this.convertStatementToNode(match);
                if (node) {
                    nodeArray.push(node);
                }
            }
        }

        return nodeArray;
    }

    scrape(text: string): { [key: number]: { value: Node, keyRef: number } } {
        let nodeDirectory: { [key: number]: { value: Node, keyRef: number } } = {};
        let dataText = text;
        while(true) {
            // Get Leaf scopes
            const scopes = this.getLeafScopes(dataText);

            // Return when no more child scopes are found
            if (!scopes) {
                break;
            }

            // Parse scope, create scope node, and update node parents
            for (const scope of scopes) {
                if (!scope) {
                    continue;
                }
                else{
                    // Collect nodes
                    const node = this.convertStatementToNode(scope.node_name);
                    const nodeArray = this.parseScope(scope.node_body);
                    const placeholderArray = scope.node_body.match(/##node-(?<id>\d+)##/gm)?.map(match => nodeDirectory[Number(match)].value);
                    const childNodeArray = placeholderArray ? nodeArray.concat(placeholderArray) : nodeArray;

                    // Update parents
                    childNodeArray.forEach(n => {
                        n.setParent(node);
                        let newId = Object.keys(nodeDirectory).length;
                        nodeDirectory[newId] = {
                            value: n ? n : new Node({ name: "##ERROR##"}), 
                            keyRef: newId
                        };
                    });

                    // Replace scope with node placeholder and store the node in the directory
                    let newId = Object.keys(nodeDirectory).length;
                    nodeDirectory[newId] = {
                        value: node ? node : new Node({ name: "##ERROR##"}), 
                        keyRef: newId
                    };
                    dataText.replace(scope.node_name + scope.node_body, `##node-${newId}##`);
                }
            }
        }

        return nodeDirectory;
    }
}