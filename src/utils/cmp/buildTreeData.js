function findRoot(datas, roots, { parent, others }) {
    datas.forEach(data => {
        if (data[parent]) {
            others.push(data)
        } else {
            roots.push(data)
        }
    })
}

function findChildren(data, ctx) {
    const { id, parent, parentName, children, others } = ctx
    const id_ = data[id]
    const children_ = []
    const rest = []
    others.forEach(child => {
        const parentId_ = child[parent]
        if (id_ == parentId_) {
            children_.push(child)
            child[parentName] = data
        } else {
            rest.push(child)
        }
    })
    if (children_.length) {
        data[children] = children_
    }
    ctx.others = rest
    children_.forEach(child => {
        findChildren(child, ctx)
    })
}
export default function buildTreeData(datas, options = {}) {
    if (!datas || !datas.length) return []
    const { id = 'id', parent = 'parent', parentName = "parentName", children = "children" } = options
    const roots = []
    let others = []
    const ctx = { id, parent, parentName, children, others }
    findRoot(datas, roots, ctx)
    roots.forEach(root => {
        findChildren(root, ctx)
    })
    return roots
}
