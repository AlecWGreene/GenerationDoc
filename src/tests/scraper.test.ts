import CodeScraper from "../codeScraper";
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
            
            // Greed a friend
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
            beforeAll(() => {
                nodes = scraper.scrape(data);
            });

            test("THEN root nodes are statements made at the global scope", () => {
                const nodeValues = Object.values(nodes);
                let node = nodeValues.pop();
                while(node && !node.value.parent){
                    node.value.children = [];
                    expect([
                        new Node({ name: "Animal", type: "const", signature: "class_standard"}, undefined, []),
                        new Node({ name: "greetFriend", arguments: "($brand, amount, dish) ", parent: "Animal", signature: "class_prototype_function_anonymous_arrow"}, undefined, []),
                        new Node({ name: "removeFriend", arguments: "animal ", parent: "Animal", signature: "class_prototype_function_anonymous_arrow" },undefined,[]),
                        new Node({ name: "makeFriend", arguments: "(animal)", parent: "Animal", signature: "class_prototype_function_anonymous" },undefined,[]),
                        new Node({ name: "takeForWalk", arguments: "(location, distance, pace)", parent: "Animal", signature: "class_prototype_function_anonymous" },undefined,[]),
                        new Node({ name: "Dog", parent: "Animal", signature: "class_standard" },undefined,[]),
                        new Node({ name: "Dog", arguments: "()", qualifiers: "async ", parent: "Dog", signature: "class_prototype_function_anonymous_arrow" },undefined,[]),
                        new Node({ name: "count", parent: "Dog", signature: "class_property_static" },undefined,[]),
                        new Node({ name: "initDogs", arguments: "()", signature: "function_standard" },undefined,[]),
                        new Node({ name: "addMyDogs", arguments: "(cost, time, dogList)", signature: "function_standard" },undefined,[]),
                        new Node({ name: "walkDogs", arguments: "()", type: "const", signature: "function_anonymous_arrow" },undefined,[]),
                        new Node({ name: "feedDogs", arguments: "(brand, amount, dish)", type: "let", signature: "function_anonymous" },undefined,[])
                    ]).toContain(node.value);
                    node = nodeValues.pop();
                }
                expect(nodeValues.length).toEqual(12);
            });

            test("THEN only root nodes have undefined parents", () => {
                const nodeValues = Object.values(nodes).map(obj => obj.value);
                for (let node of nodeValues) {
                    if (!node.parent) {
                        expect([
                            new Node({ name: "Animal", type: "const", signature: "class_standard"}, undefined, []),
                            new Node({ name: "greetFriend", arguments: "($brand, amount, dish) ", parent: "Animal", signature: "class_prototype_function_anonymous_arrow"}, undefined, []),
                            new Node({ name: "removeFriend", arguments: "animal ", parent: "Animal", signature: "class_prototype_function_anonymous_arrow" },undefined,[]),
                            new Node({ name: "makeFriend", arguments: "(animal)", parent: "Animal", signature: "class_prototype_function_anonymous" },undefined,[]),
                            new Node({ name: "takeForWalk", arguments: "(location, distance, pace)", parent: "Animal", signature: "class_prototype_function_anonymous" },undefined,[]),
                            new Node({ name: "Dog", parent: "Animal", signature: "class_standard" },undefined,[]),
                            new Node({ name: "Dog", arguments: "()", qualifiers: "async ", parent: "Dog", signature: "class_prototype_function_anonymous_arrow" },undefined,[]),
                            new Node({ name: "count", parent: "Dog", signature: "class_property_static" },undefined,[]),
                            new Node({ name: "initDogs", arguments: "()", signature: "function_standard" },undefined,[]),
                            new Node({ name: "addMyDogs", arguments: "(cost, time, dogList)", signature: "function_standard" },undefined,[]),
                            new Node({ name: "walkDogs", arguments: "()", type: "const", signature: "function_anonymous_arrow" },undefined,[]),
                            new Node({ name: "feedDogs", arguments: "(brand, amount, dish)", type: "let", signature: "function_anonymous" },undefined,[])
                        ]).toContain(node);
                    }
                }
            });
        });
    });
});