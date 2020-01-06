<template>
  <el-pagination
    :style="{textAlign}"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
    :current-page="pageNo"
    :page-sizes="sizes"
    :page-size="page.size"
    :layout="layout"
    :total="total">
  </el-pagination>
</template>

<script>

export default {
  name: 'dx-pagination',
  props: {
    page: {
      type: [Object, Page]
    },
    total: {
      type: Number,
    },
    textAlign: {
      type: String,
      default: 'right'
    },
    baseOnZero: {
      type: Boolean,
      default: true
    },
    layout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper'
    },
    sizes: {
      type: Array,
      default(){
        return [10, 20, 50, 100]
      }
    }
  },

  computed:{
    pageNo(){
      return this.page.page + this.baseOnZero
    }
  },

  methods: {
    handleSizeChange(pageSize){
      this.page.size = pageSize
      this.$emit('change', {page: this.page, type: 'size'})
    },
    handleCurrentChange(pageNumber){
      this.page.page = pageNumber-this.baseOnZero
      this.$emit('change', {page: this.page, type: 'page'})
    },
  }
};
function Page(page, size){
  this.page = page;
  this.size = size;
}
Page.prototype.setPage = function(page){
  this.page = page
}
Page.prototype.setSize = function(size){
  this.size = size
}
Page.prototype.set = function(page, size){
  if(page && page.size){
    this.page = page.page
    this.size = page.size
  }else{
    this.page = page
    this.size = size
  }
}
export function getPage(page=0, size=10){
  return new Page(page, size)
}
</script>

<style scoped>
</style>
