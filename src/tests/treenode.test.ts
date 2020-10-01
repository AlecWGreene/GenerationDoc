import { TreeNode } from "../classes/treenode";

describe("class TreeNode", () => {
    const types = [Number, String, Object];
    for(let type of types) {
        describe(`Given a type ${type.name}`, () => {
            let node1: any;
            let node2: any;
            let node3: any;
            let node4: any;
            beforeEach(() => {
                let defaultValue: any = false;
                let values: Array<any> = [];
                switch(type.name) {
                    case "Number":
                        defaultValue = 0;
                        values = [1,2,3,4];
                        break;
                    case "String":
                        defaultValue = "";
                        values = ["a","b","c","d"];
                        break;
                    case "Object":
                        defaultValue = {};
                        values = [{ x: 1, y: "a"}, { x: 2, y: "b"}, { x: 3, y: "c"}, { x: 4, y: "d"}];
                        break;
                }
                node1 = new TreeNode<typeof type>(undefined, [node2, node3], values[0]);
                node2 = new TreeNode<typeof type>(node1, [node4], values[1]);
                node3 = new TreeNode<typeof type>(node1, [], values[2]);
                node4 = new TreeNode<typeof type>(node2, [], values[3]);
            });
            describe("When instantiated", () => {

                test("Copies the data correctly", () => {
                    // Generate reference data
                    let data: any;
                    switch(type.name) {
                        case "Number":
                            data = 314;
                            break;
                        case "String":
                            data = "asdf";
                            break;
                        case "Object":
                            data = {
                                length: 20,
                                proof: {
                                    size: 19
                                }
                            }
                            break;
                    }
                    let nodeA = new TreeNode<typeof type>(undefined, [], data);
                    let nodeB = new TreeNode<typeof type>(nodeA, [], data);
                    let nodeC = new TreeNode<typeof type>(nodeB, [], data);
                    let childArray = [nodeB, nodeC]

                    // Test node
                    let testNode = new TreeNode<typeof type>(nodeA, childArray, data);

                    // Expect that testNode data matches reference data
                    expect(JSON.stringify(testNode.parent)).toEqual(JSON.stringify(nodeA));
                    expect(JSON.stringify(testNode.children)).toEqual(JSON.stringify(childArray));
                    expect(JSON.stringify(testNode.data)).toEqual(JSON.stringify(data));

                    // Mutate reference data
                    switch(type.name) {
                        case "Number":
                            data = 7;
                            break;
                        case "String":
                            data = "no";
                            break;
                        case "Object":
                            data = {
                                length: 0,
                                proof: {
                                    size: "big"
                                }
                            }
                            break;
                    }

                    // Expect that testNode properties have not changed
                    expect(JSON.stringify(testNode.parent)).toEqual(JSON.stringify(nodeA));
                    expect(JSON.stringify(testNode.children)).toEqual(JSON.stringify(childArray));
                    expect(JSON.stringify(testNode.data)).not.toEqual(JSON.stringify(data));
                });

            });
        
            describe("When a parent is added", () => {
                let nodeA: TreeNode<typeof type> | undefined;
                let nodeB: TreeNode<typeof type> | undefined;
                let nodeC: TreeNode<typeof type> | undefined;
                let data: any[];
                switch(type.name) {
                    case "Number":
                        data = [7,11];
                        break;
                    case "String":
                        data = ["yes", "no"];
                        break;
                    case "Object":
                        data = [{x: 0, y: 0}, { x: 1, y: 1}]
                        break;
                }
                beforeEach(() =>{
                    nodeA = new TreeNode<typeof type>(undefined, [], data[0]);
                    nodeB = new TreeNode<typeof type>(undefined, [], data[1]);
                    nodeC = new TreeNode<typeof type>(undefined, [], data[0]);
                    nodeA.setParent(nodeC);
                    nodeA.setParent(nodeB);
                });
                afterEach(() => {
                    nodeA = undefined;
                    nodeB = undefined;
                    nodeC = undefined;
                });

                test("The node's parent property is updated", () => {
                    expect(nodeA?.parent).toEqual(nodeB);
                });
                test("The node's parent's children property is updated", () => {
                    expect(nodeB?.children).toContain(nodeA);
                });
                test("The node's old parent's children property is updated", () => {
                    expect(nodeC?.children).not.toContain(nodeA);
                });
            });

            describe("When a child is added", () => {
                let nodeA: TreeNode<typeof type> | undefined;
                let nodeB: TreeNode<typeof type> | undefined;
                let data: any[];
                switch(type.name) {
                    case "Number":
                        data = [7,11];
                        break;
                    case "String":
                        data = ["yes", "no"];
                        break;
                    case "Object":
                        data = [{x: 0, y: 0}, { x: 1, y: 1}]
                        break;
                }
                beforeEach(() =>{
                    nodeA = new TreeNode<typeof type>(undefined, [], data[0]);
                    nodeB = new TreeNode<typeof type>(undefined, [], data[1]);
                    nodeA.addChild(nodeB);
                });
                afterEach(() => {
                    nodeA = undefined;
                    nodeB = undefined;
                });

                test("The node's children property is updated", () => {
                    expect(nodeA?.children).toContain(nodeB);
                });
                test("The node's new child's parent property is updated", () => {
                    expect(nodeB?.parent).toEqual(nodeA);
                });
            });
            
            describe("When a child is removed", () => {
                let nodeA: TreeNode<typeof type> | undefined;
                let nodeB: TreeNode<typeof type> | undefined;
                let nodeC: TreeNode<typeof type> | undefined;
                let data: any[];
                switch(type.name) {
                    case "Number":
                        data = [7,11];
                        break;
                    case "String":
                        data = ["yes", "no"];
                        break;
                    case "Object":
                        data = [{x: 0, y: 0}, { x: 1, y: 1}]
                        break;
                }
                beforeEach(() =>{
                    nodeA = new TreeNode<typeof type>(undefined, [], data[0]);
                    nodeB = new TreeNode<typeof type>(undefined, [], data[1]);
                    nodeC = new TreeNode<typeof type>(undefined, [nodeA, nodeB], data[0]);
                    nodeC.removeChild(nodeA);
                });
                afterEach(() => {
                    nodeA = undefined;
                    nodeB = undefined;
                    nodeC = undefined;
                });

                test("Child no longer appears in node's children array", () => {
                    expect(nodeC).not.toContain(nodeA);
                });

                test("Child no longer links to the parent node", () => {
                    expect(nodeA?.parent).not.toEqual(nodeC);
                });
            });
        });
    }
})