import CodeScraper from "../codeScraper";
import * as fs from "fs";
import { Node } from "../codeScraper";
import * as languages from "../languages/index";

describe("Testing CodeScraper:", () => {
    describe("GIVEN Nodes", () => {
        let nodeA: Node, nodeB: Node, nodeC: Node;
        beforeEach(() => {
            nodeA = new Node({ name: "node-A", type: "string"}, undefined, [nodeB]);
            nodeB = new Node({ name: "node-B", type: "boolean"});
            nodeC = new Node({ name: "node-C", type: "int[]"}, nodeB);
        });

        describe("WHEN they are initialized", () => {
            test("THEN Parent-Child relationships are completed", () => {
                expect(nodeB.children).toContain(nodeC);
                expect(nodeC.parent).toBe(nodeB);
            });
        });

        describe("WHEN a parent is set", () => {
            beforeEach(() => {
                nodeC.setParent(nodeA);
            });

            test("THEN node is removed from previous parent's child array", () => {
                expect(nodeB.children).not.toContain(nodeC);
            });

            test("THEN node is added to new parent's child array", () => {
                expect(nodeA.children).toContain(nodeC);
            });
        });
    });

    describe("GIVEN language is JavaScript", () => {
        const scraper = new CodeScraper(languages.javascript);
        describe("WHEN Collecting leaf scopes", () => {
            const data = `
    class Animal {
        constructor(name, sound){
            this.species = name;
            this.sound = sound;
            this.data = {
                name: name,
                sound: sound
            }
        }

        speak(){
            console.log(this.sound);
        }
    }

    class Dog extends Animal {
        constructor(name, color){
            this.timeout = setTimeout(() => {
                this.name = name;
            },5000);
        }
    }
    `;
            test("THEN only selects scopes with no child scopes", () => {
                const nodes = scraper.getLeafScopes(data);
                expect(nodes).toHaveLength(3);
            });

        });

        describe("WHEN parsing code blocks", () => {
            test("THEN childless scopes are parsed into a Node array", () => {
                const data = `
this.data = 1;
this.name = "testScope";
fnCall();
testClass.prop = [];                
`
                expect(scraper.parseScope(data)).toEqual([
                    new Node({ name: "data", signature: "class_property_standard"}),
                    new Node({ name: "name", signature: "class_property_standard"}),
                    new Node({ name: "prop", signature: "class_property_static", parent: "testClass"})
                ]);
            });

            test("THEN local variables are excluded", () => {
                const data = `
this.data = 1;
const testVar = 2;
this.name = "testScope";           
`;               
                expect(scraper.parseScope(data).map(node => node.data.name?.trim())).not.toContain("testVar");
            });
        });
    
        describe("WHEN scraping a file", () => {
            const data = `const dogCollection = [];
            let myDogs = [];
            
            // Animal class
            class Animal {
                constructor(name, sound) {
                    this.species = name;
                    this.sound = sound;
                }
                
                speak() {
                    console.log(this.sound);
                }
            }
            
            Animal.prototype.greetFriend = () => this.speak();
            
            // Feed the pet
            Animal.prototype.feed = ($brand, amount, dish) => {
                const data = {
                    brand: $brand,
                    amount: amount,
                    dish: dish
                }
                console.log(data);
                console.log("Yum!");
            }
            
            // Remove a friend
            Animal.prototype.removeFriend = animal => {
                if(!this.friends) {
                    return;
                }
                
                if(!animal.friends) {
                    return;
                }
                
                if(!this.friends.includes(animal)){
                    return;
                }
                
                this.friends = this.friends.filter(friend => friend !== animal);
                animal.friends = animal.friends.filter(friend => friend !== this);
            }
            
            // Connect animals as friends
            Animal.prototype.makeFriend = function(animal) {
                if(!this.friends) {
                    this.friends = [];
                }
                
                if(!animal.friends) {
                    animal.friends = [];
                }
                
                this.friends.push(animal);
                animal.friends.push(this);
            }
            
            // Walk the pet
            Animal.prototype.takeForWalk = function(location, distance, pace) {
                const data = {
                    location: location,
                    distance: distance,
                    pace: pace
                }
                console.log(data);
                console.log("I'm tired!");
            }
            
            // Dog class 
            class Dog extends Animal {
                constructor(name, color) {
                    super("dog","woof");
                    Dog.count = Dog.count + 1;
                    this.name = name;
                    this.color = color;
                    this.family = {
                        mother: undefined,
                        father: undefined
                    }
                }
                
                setParent(name, descriptor){
                    this.family[descriptor] = name;
                }
                
                static zoomies(location, duration){
                    console.log("Dogs are running around location for duration minutes");
                }
                
                async static ringDinnerBell() {
                    for(let dog of DogCollection) {
                        await dog.come();
                    }
                    
                    console.log("dinner time!");
                }
            }
            
            Dog.prototype.come = async () => {
                return await setTimeout(() => {
                    console.log(" is coming!");
                },5000);
            } 

            function Person(name){
                this.name = name;
                this.species = "human";
                this.sound = "wololo";
            }

            Person.prototype.speak = () => console.log(this.sound);
            
            Dog.count = 0;
            
            function initDogs(){
                dogCollection.push(new Dog("yukio","white"));
                dogCollection.push(new Dog("apollo","grey"));
            }
            
            function addMyDogs(cost, time, dogList) {
                myDogs = dogList;
            }
            
            const walkDogs = () => {
                for(let dog of myDogs) {
                    dog.takeForWalk("park", 1, 10);
                }
            }
            
            let feedDogs = function(brand, amount, dish){
                for(let dog of myDogs) {
                    dog.feed(brand, amount, dish);
                }
            }`;
            let nodes: { [key: number]: { value: Node, keyRef: number } } = {};
            let nodeGraph: Node[];
            beforeEach(() => {
                const scraper = new CodeScraper(languages.javascript);
                nodes = scraper.scrape(data);
            });

            test("THEN root nodes are statements made at the global scope", () => {
                const nodeValues = Object.values(nodes);
                const rootNodes = [];
                for(const node of nodeValues.filter(n => n.value.parent === undefined)){
                    node.value.children = [];
                    expect([
                        new Node({ name: "Animal", signature: "class_standard"}, undefined, []),
                        new Node({ name: "feed", arguments: "($brand, amount, dish)", parent: "Animal", signature: "class_prototype_function_anonymous_arrow"}, undefined, []),
                        new Node({ name: "greetFriend", arguments: "()", parent: "Animal", signature: "class_prototype_function_anonymous_arrow"}, undefined, []),
                        new Node({ name: "removeFriend", arguments: "animal ", parent: "Animal", signature: "class_prototype_function_anonymous_arrow" },undefined,[]),
                        new Node({ name: "makeFriend", arguments: "(animal)", parent: "Animal", signature: "class_prototype_function_anonymous" },undefined,[]),
                        new Node({ name: "takeForWalk", arguments: "(location, distance, pace)", parent: "Animal", signature: "class_prototype_function_anonymous" },undefined,[]),
                        new Node({ name: "Dog", parent: "Animal", signature: "class_extends" },undefined,[]),
                        new Node({ name: "Dog", arguments: "()", qualifiers: "async ", parent: "Dog", signature: "class_prototype_function_anonymous_arrow" },undefined,[]),
                        new Node({ name: "count", parent: "Dog", signature: "class_property_static" },undefined,[]),
                        new Node({ name: "come", parent: "Dog", signature: "class_prototype_function_anonymous_arrow", arguments: "()", qualifiers: "async "}),
                        new Node({ name: "initDogs", arguments: "()", signature: "function_standard" },undefined,[]),
                        new Node({ name: "addMyDogs", arguments: "(cost, time, dogList)", signature: "function_standard" },undefined,[]),
                        new Node({ name: "walkDogs", arguments: "()", type: "const", signature: "function_anonymous_arrow" },undefined,[]),
                        new Node({ name: "feedDogs", arguments: "(brand, amount, dish)", type: "let", signature: "function_anonymous" },undefined,[]),
                        new Node({ name: "count", parent: "Dog", signature: "class_property_static"}),
                        new Node({ name: "Person", arguments: "(name)", signature: "function_standard"},undefined,[]),
                        new Node({ name: "speak", arguments: "()", parent: "Person", signature: "class_prototype_function_anonymous_arrow"},undefined,[])
                    ]).toContainEqual(node.value);
                    rootNodes.push(node);
                }
                expect(rootNodes.length).toEqual(15);
            });

            test("THEN only root nodes have undefined parents", () => {
                const nodeValues = Object.values(nodes).map(obj => obj.value);
                for (let node of nodeValues) {
                    if (!node.parent) {
                        node.children = [];
                        expect([
                            new Node({ name: "Animal", signature: "class_standard"}, undefined, []),
                            new Node({ name: "feed", arguments: "($brand, amount, dish)", parent: "Animal", signature: "class_prototype_function_anonymous_arrow"}, undefined, []),
                            new Node({ name: "greetFriend", arguments: "()", parent: "Animal", signature: "class_prototype_function_anonymous_arrow"}, undefined, []),
                            new Node({ name: "removeFriend", arguments: "animal ", parent: "Animal", signature: "class_prototype_function_anonymous_arrow" },undefined,[]),
                            new Node({ name: "makeFriend", arguments: "(animal)", parent: "Animal", signature: "class_prototype_function_anonymous" },undefined,[]),
                            new Node({ name: "takeForWalk", arguments: "(location, distance, pace)", parent: "Animal", signature: "class_prototype_function_anonymous" },undefined,[]),
                            new Node({ name: "Dog", parent: "Animal", signature: "class_extends" },undefined,[]),
                            new Node({ name: "Dog", arguments: "()", qualifiers: "async ", parent: "Dog", signature: "class_prototype_function_anonymous_arrow" },undefined,[]),
                            new Node({ name: "count", parent: "Dog", signature: "class_property_static" },undefined,[]),
                            new Node({ name: "come", parent: "Dog", signature: "class_prototype_function_anonymous_arrow", arguments: "()", qualifiers: "async "}),
                            new Node({ name: "initDogs", arguments: "()", signature: "function_standard" },undefined,[]),
                            new Node({ name: "addMyDogs", arguments: "(cost, time, dogList)", signature: "function_standard" },undefined,[]),
                            new Node({ name: "walkDogs", arguments: "()", type: "const", signature: "function_anonymous_arrow" },undefined,[]),
                            new Node({ name: "feedDogs", arguments: "(brand, amount, dish)", type: "let", signature: "function_anonymous" },undefined,[]),
                            new Node({ name: "count", parent: "Dog", signature: "class_property_static"}),
                            new Node({ name: "Person", arguments: "(name)", signature: "function_standard"},undefined,[]),
                            new Node({ name: "speak", arguments: "()", parent: "Person", signature: "class_prototype_function_anonymous_arrow"},undefined,[])
                        ]).toContainEqual(node);
                    }
                }
            });

            test("THEN classes, constructors, and global functions are identified",()=>{
                nodeGraph = scraper.parseNodeDirectory(nodes);
                nodeGraph.forEach(n => {
                    expect(["class_standard", "class_extends", "function_standard", "function_anonymous", "function_anonymous_arrow"]).toContainEqual(n.data.signature);
                });
            });
    
            test("THEN nodes are assembled into a directed acyclic graph",()=>{
                nodeGraph = scraper.parseNodeDirectory(nodes);

                // Parse each root node a tree root
                let tree: {[key: string]: Node[]} = {};
                nodeGraph.forEach(n => {
                    tree[n.data.name] = [n];
                });

                // Distribute nodes to their parents
                Object.values(nodes).forEach(({ value }) => {
                    const n = value;

                    // Skip root nodes
                    if(nodeGraph.includes(n)) {
                        return;
                    }
                    // Skip placeholder nodes
                    else if(n.data.name === "##PLACEHOLDER##"){
                        return;
                    }
                    // Skip duplicates
                    else if(Object.values(tree).find(arrar => arrar.find(arrayEntry => arrayEntry.data.name === n.data.name))){
                        return;
                    }

                    // Find the parent
                    let node: Node | undefined = n;
                    while(node?.parent && node.data.signature !== "class_extends"){
                        node = node?.parent;
                    }

                    // Assign node to the parent array
                    const root = nodeGraph.find(root => root.data.name === node?.data.name);
                    if(root){
                        tree[root.data.name].push(n);
                    }
                });

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
                fs.writeFileSync(__dirname + "/../../test-data/app-node-tree.json", JSON.stringify(returnData, undefined, "\t"));
                
                // Check that the nodes are assigned correctly
                expect(returnData["Animal"].length).toEqual(11);
                expect(returnData["Dog"].length).toEqual(8);
                expect(returnData["Person"].length).toEqual(5);
                expect(returnData["initDogs"].length).toEqual(1);
                expect(returnData["addMyDogs"].length).toEqual(1);
                expect(returnData["walkDogs"].length).toEqual(1);
                expect(returnData["feedDogs"].length).toEqual(1);
            });
        });
    });
});