import { identifier } from "@babel/types"

class Language {
  name: String
  accessors: Array<String> 
  qualifiers: Array<String> 
  tokens: Array<String> 
  types: Array<String>
  signatures: Array<Array<String>>
  argumentPatterns: Array<Array<String>>
  identifierRule: String

  constructor(name: String, 
              accessors: Array<String>, 
              qualifiers: Array<String>, 
              tokens: Array<String>, 
              types: Array<String>, 
              signatures: Array<Array<String>>,
              argumentPatterns: Array<Array<String>>,
              identifierRule: String) {
                
    this.name = name;
    this.accessors = Array.from(accessors);
    this.qualifiers = Array.from(qualifiers);
    this.tokens = Array.from(tokens);
    this.types = Array.from(types); 
    this.signatures = Array.from(signatures);
    this.argumentPatterns = Array.from(argumentPatterns);
    this.identifierRule = identifierRule;
  }
}

export { Language };
