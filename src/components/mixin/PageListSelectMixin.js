const sortBySelectIndex=(a,b)=>{
  const sa = a.selectIndex, sb = b.selectIndex
  return sa < sb ? 1: (sa == sb ? 0 : -1)
};
export default {
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    muti: Boolean,
    value: [Object, Array],
    idProp: {
      type: String,
      default: 'id',
    }
  },

  data(){
    return {
      selectCurrentPage: false, //当前页全部选中
      allPageSelects: {},//所有页面的选中
      selectIndex: 0, //选中顺序

      tableData: [],//当前页列表数据
    }
  },

  computed: {
    selectCurrentPageIndeterminate(){
      const allPageSelects = this.allPageSelects
      let count = 0
      const idProp = this.idProp
      this.tableData.forEach(row=>{
        if(allPageSelects[row[idProp]]){
          count++
        }
      });
      this.selectCurrentPage = count == this.tableData.length
      return count > 0 && count < this.tableData.length
    },
  },

  methods: {
    // noop(){},

    onSelectCurrentPageChange(checked){
      const allPageSelects = this.allPageSelects
      const idProp = this.idProp
      if(checked){
        let selectIndex = this.selectIndex
        this.tableData.forEach(row=>{
          allPageSelects[row[idProp]] = {item: row, selectIndex: selectIndex++}
        });
        this.selectIndex = selectIndex
      }else{
        this.tableData.forEach(row=>{
          this.$delete(allPageSelects, row[idProp])
        });
      }
      this.triggerChange()
    },

    getRowSelect(row){
      return !!this.allPageSelects[row[this.idProp]]
    },

    setRowSelect(row, checked){
      const id = row[this.idProp]
      this._setSelect(row, checked, id)
    },

    toggleRowSelect(row){
      const id = row[this.idProp]
      const old = this.allPageSelects[id]
      this._setSelect(row, !old, id)
    },

    _setSelect(row, checked, id){
      if(checked){
        if(this.muti){
          this.$set(this.allPageSelects, id, {item: row, selectIndex: this.selectIndex++})
        }else{
          this.allPageSelects = {
            [id]: {item: row}
          }
        }
      }else{
        if(this.muti){
          this.$delete(this.allPageSelects, id)
        }else{
          this.allPageSelects = {}
        }
      }
      this.triggerChange()
    },

    triggerChange(){
      let value
      const allPageSelects = this.allPageSelects
      if(this.muti){
        value = []
        for(var id in allPageSelects){
          value.push(allPageSelects[id])
        }
        value.sort(sortBySelectIndex)
        value = value.map(item=>item.item)
      }else{
        for(var id in allPageSelects){
          value = allPageSelects[id].item
        }
      }
      this.$emit('change', value)
    },

  },

  watch: {
    value: {
      immediate: true,
      handler(value){
        const allPageSelects = {}
        if(this.muti){
          this.selectCurrentPage = false
          let selectIndex = 0
          if(value){
            value = [].concat(value)
            const idProp = this.idProp
            value.forEach(item=>{
              const id = item[idProp]
              allPageSelects[id] = {
                item,
                index: selectIndex++,
              }
            });
          }
          this.selectIndex = selectIndex
        }else{
          if(value){
            allPageSelects[value[this.idProp]] = {item: value}
          }
        }
        this.allPageSelects = allPageSelects
      }
    },
  },
}
