import Language from "./models/language";
import * as languages from "./languages";
import * as fs from "fs";

export class Node {
    parent: Node | undefined
    children: Node[]
    data: {
        parent?: string
        name: string
        type?: string
        qualifiers?: string
        arguments?: string
        signature?: string
    }

    constructor(data: { name: string, [key: string]: string}, parent?: Node, children?: Node[]) {
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
    static leafExpression: RegExp = /(?<node_name>[\s\w\.\=\-\_\[\]\:\(\)\!\?\"\'\`\$\+\,\&\^\%\>\<\/\|]*{)(?<node_body>[\s\w\.\=\-\_\[\]\:\(\)\!\?\"\'\`\$\+\,\&\^\%\>\<\/\|;\*\@\#]*)\s*}/gm
    static statementExpression: RegExp = /[^;\n\r]+(?=;|\n|\r|$)/gm

    constructor(language: Language, settings?: { include?: { functions?: Boolean, properties?: Boolean, classes?: Boolean} }) {
        this.language = language;
    }

    getLeafScopes(text: string): ( {[key: string]: string} | undefined)[] | undefined {
        // Find matches on a global regex search and then match each entry into its capturing groups
        const matches = text.match(CodeScraper.leafExpression);
        if(matches !== null && matches !== undefined) {
            return matches.map(m => m !== null ? 
                                    m.match(/(?<node_name>[\s\w\.\=\-\_\[\]\:\(\)\!\?\"\'\`\$\+\,\&\^\%\>\<\/\|]*{)(?<node_body>[\s\w\.\=\-\_\[\]\:\(\)\!\?\"\'\`\$\+\,\&\^\%\>\<\/\|;\*\@\#]*\s*})/m)?.groups 
                                    : undefined);
        }

        return undefined;
    }

    convertStatementToNode(text: string): Node | undefined {
        for (const signature of Object.entries(this.language.expressions)) {
            const match = text.match(new RegExp(signature[1]));
            if (match !== null && match.groups !== undefined) {
                const nodeData: any = {};

                // Copy defined fields to nodeData and append the signature
                for(const prop in match.groups){
                    if (match.groups[prop]) {
                        nodeData[prop] = match.groups[prop];
                    }
                }
                nodeData.signature = signature[0];

                return new Node(nodeData);
            }
        }

        if (text.match(/((?:if|switch|for|when|else if)\s*\([^;\n\r\(\)]+\)\s*)|(else\s*){/m)) {
            return new Node({ name: "##PLACEHOLDER##"});
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
                    const nameNode = this.convertStatementToNode(scope.node_name);
                    const nodeArray = this.parseScope(scope.node_body);
                    const placeholderArray = scope.node_body.match(/##node-(?<id>\d+)##/gm)?.map(match => nodeDirectory[Number(match.match(/##node-(?<id>\d+)##/m)?.groups?.id)].value);

                    // Select all retrieved nodes
                    if (nodeArray.length > 0 && placeholderArray) {
                        // Update parents
                        const childNodeArray = nodeArray.concat(placeholderArray);
                        childNodeArray.forEach(n => {
                            n.setParent(nameNode);
                            let newId = Object.keys(nodeDirectory).length;
                            nodeDirectory[newId] = {
                                value: n, 
                                keyRef: newId
                            };
                        });
                    }
                    else if (nodeArray.length > 0) {
                        // Update parents
                        nodeArray.forEach(n => {
                            n.setParent(nameNode);
                            let newId = Object.keys(nodeDirectory).length;
                            nodeDirectory[newId] = {
                                value: n, 
                                keyRef: newId
                            };
                        });
                    }
                    else if (placeholderArray) {
                        // Update parents
                        placeholderArray.forEach(n => {
                            n.setParent(nameNode);
                            let newId = Object.keys(nodeDirectory).length;
                            nodeDirectory[newId] = {
                                value: n, 
                                keyRef: newId
                            };
                        });
                    }

                    // Replace scope with node placeholder and store the node in the directory
                    let newId = Object.keys(nodeDirectory).length;
                    const scopeText = scope.node_name + scope.node_body;
                    dataText = dataText.replace(scopeText, `##node-${newId}##`);
                    nodeDirectory[newId] = {
                        value: nameNode ? nameNode : new Node({ name: "##PLACEHOLDER##"}), 
                        keyRef: newId
                    };
                    fs.writeFileSync(__dirname + `/../test-data/app-scope-${Object.values(nodeDirectory).length}.txt`, dataText);
                }
            }
        }

        // Collect global assignments that were not found
        const globalNodes = this.parseScope(dataText);
        globalNodes.forEach(node => {
            let newId = Object.keys(nodeDirectory).length;
            nodeDirectory[newId] = {
                value: node, 
                keyRef: newId
            };
        });


        return nodeDirectory;
    }

    // Convert a node directory into a readable tree of code expressions
    parseNodeDirectory(directory: { [key: number]: { value: Node, keyRef: number } }): { [key: string]: Node[] } {
        // Get nodes with undefined parents
        const entries = Object.values(directory);
        let rootNodes = entries.filter(obj => obj.value.parent === undefined).map(obj => obj.value);

        // Remove nodes which have parents in their data except for classes
        rootNodes.forEach(node => {
            if (node.data.parent && node.data.signature !== "class_extends") {
                node.parent = entries.find(ent => ent.value.data.name === node.data.parent)?.value;
            }
        });
        rootNodes = rootNodes.filter(node => node.parent === undefined);

        // Parse each root node a tree root
        let tree: {[key: string]: Node[]} = {};
        rootNodes.forEach(n => {
            tree[n.data.name] = [n];
        });

        // Distribute nodes to their parents
        Object.values(directory).forEach(({ value }) => {
            const n = value;

            // Skip root nodes
            if(rootNodes.includes(n)) {
                return;
            }
            // Skip placeholder nodes
            else if(n.data.name === "##PLACEHOLDER##"){
                return;
            }

            // Find the parent
            let node: Node | undefined = n;
            while(node?.parent && node.data.signature !== "class_extends"){
                node = node?.parent;
            }

            // Skip duplicates under the same parent
            if (tree[node.data.name].find(existingNode => existingNode.data.name === n.data.name )) {
                return;
            }

            // Assign node to the parent array
            const root = rootNodes.find(root => root.data.name === node?.data.name);
            if(root){
                tree[root.data.name].push(n);
            }
        });

        return tree;
    }

    // Write node directory to file
    printNodeDirectoryToFile(nodeDirectory: { [key: number]: { value: Node, keyRef: number } }): void {
        const visited = new WeakSet();
        function reduceDirectoryNode(this: any, key: string, value: any){
            if (typeof value === "object" && value !== null) {
                if (key === "parent") {
                    return value.data.name;
                }
                else if (visited.has(value)) {
                    switch(key) {
                        case "value":
                            return value;
                        case "data":
                            return value.data;
                        case "parent":
                            return value.data.name;
                        default:
                            return key;
                    }
                }
                visited.add(value);
            }    
            return value;
        }
        fs.writeFileSync(__dirname + `/../test-data/app-node-directory.json`, JSON.stringify(nodeDirectory, reduceDirectoryNode, "\t"));
    }

    // Print a node directory to a json
    printNodeTreeToFile(tree: { [key: string]: Node[]}, path: string): void {
         // Write data to file
         const returnData: { [key: string]: { name: string | undefined, arguments: string | undefined, signature: string | undefined}[]} = {};
         for (const rootName in tree) {
             returnData[rootName] = tree[rootName].map(obj => {
                 return {
                     name: obj.data.name,
                     arguments: obj.data.arguments,
                     signature: obj.data.signature
                 };
             });
         }
         fs.writeFileSync(__dirname + path, JSON.stringify(returnData, undefined, "\t"));
    }
}