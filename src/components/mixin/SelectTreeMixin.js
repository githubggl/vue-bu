export default {
  inheritAttrs: false,
  model: {
    prop: 'value',
    event: 'change'
  },
  props:{
    treeData: Array,
    highlightCurrent:{
      type:Boolean,
      default:true
    },
    filterValue:"",
    isMulti: {
      type: Boolean,
      default: false
    },
    checkOnClickNode: {
      type: Boolean,
      default: true
    },
    value:{
      type: [Array, Object]
    },
  },
  data() {
    return {
      props: {
        label: 'name',
        children: 'children',
        isLeaf: 'leaf'
      },
      nodeKey: 'id',

      data: this.treeData || [],

      modelValue: null,

      defaultExpandedKeys: [],
      defaultCheckedKeys: [],
    }
  },
  computed:{
    isCheckOnClickNode(){
      if(!this.isMulti){
        return false;
      }
      return this.checkOnClickNode;
    },
    model: {
      get() {
        return  this.modelValue
      },
      set(val) {
        this.$emit('change', val);
        this.modelValue = val;
      }
    },
  },
  methods:{
    getTree(){
      return this.$refs.tree;
    },
    setCurrentKey(key){
      this.getTree().setCurrentKey(key);
    },
    setCheckedKeys(keysArr){
      this.getTree().setCheckedKeys(keysArr)
    },
    getCheckedKeys(){
      this.getTree().getCheckedKeys()
    },
    filter(v){
      this.getTree().filter(v)
    },
    checkChange(item, check, checkChildren){
      if(this.isMulti){
        if(check){
          this.model = this.modelValue.concat([item])
        }else{
          const model = []
          for(var i=0,len=this.modelValue.length; i<len; i++){
            let tmp = this.modelValue[i]
            if(tmp != item){
              model.push(tmp)
            }
          }
          this.model = model
        }
      }else{
        if(check){
          this.model = item
          this.setCheckedKeys([item.id])
        }else{
          if(this.model === item){
            this.model = null
          }
        }
      }
    },
    handleNodeClick(item,vNode,node) {
      if(node.showCheckbox){
        if(!this.isMulti){
          // this.editCheckId = item.id;
          node.tree.setCheckedKeys([item.id]);
        }else{
          let keys = this.getCheckedKeys()||[];
          const index = keys.indexOf(item.id)
          if(index<0){
            keys.push(item.id);
          }else{
            keys.splice(index, 1);
          }
          this.setCheckedKeys(keys);
        }
      }
      this.$emit("nodeClick", {item, node});
    },

    updateModelValue(){
      const value = this.value
      let modelValue
      let keys = []
      if(this.isMulti){
        modelValue = []
        if(value){
          modelValue.concat(value)
        }
        keys = modelValue.map(item=>item[this.nodeKey])
      }else{
        modelValue = value
        if(value){
          keys.push(value[this.nodeKey])
        }
      }
      this.modelValue = modelValue

      this.defaultCheckedKeys = keys
      this.defaultExpandedKeys = keys
    },

    getRenderProps(){
      const props = {...this.$attrs}
      // props.ref = "tree"
      props.props = this.props
      props.data = this.data
      props.highlightCurrent = this.highlightCurrent
      props.checkOnClickNode = this.checkOnClickNode
      props.defaultExpandedKeys = this.defaultExpandedKeys
      props.defaultCheckedKeys = this.defaultCheckedKeys
      props.nodeKey = this.nodeKey
      return props
    },

    getRenderOn(){
      return {
        'check-change': this.checkChange
      }
    },

  },

  mounted(){
    this.updateModelValue()
  },

  watch:{
    filterValue: 'filter',
    isMulti: 'updateModelValue',
    value: {
      handler: 'updateModelValue',
      immediate: true,
    },
    treeData: function(treeData){
      this.data = treeData
    },
  },

  render(createElement){
    const props = this.getRenderProps()
    const on = this.getRenderOn()
    return createElement('el-tree', {'ref': 'tree','class': '', props: props, on: on})
  },
}
