class TreeNode<T> {
    // Properties
    parent: TreeNode<T> | undefined
    children: Array<TreeNode<T>>
    data: T

    constructor(parent: TreeNode<T> | undefined, children: Array<TreeNode<T>>, data: T) {
        this.parent = (parent !== undefined) ? parent : undefined;
        this.children = children;
        this.data = copyData(data);
    }

    setParent(node: TreeNode<T>): void {
        // Remove this from parent's children array
        if(this.parent !== undefined){
            this.parent.children = this.parent.children.filter(n => n !== this);
        }
        this.parent = node;
        node.children.push(this);
    }

    addChild(node: TreeNode<T>): void {
        this.children.push(node);
        node.parent = this;
    }

    removeChild(node: TreeNode<T>): void {
        node.parent = undefined;
        this.children = this.children.filter(n => n !== node);
    }
}

function copyData(data: any) {
    return JSON.parse(JSON.stringify(data));
}


export { TreeNode }