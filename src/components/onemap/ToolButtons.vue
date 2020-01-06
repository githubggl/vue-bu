<template>
  <el-container ref="container" class="toolButtons">
    <el-aside v-show="showNav" class="aside" style="width: 22px;">
      <el-button class="nav" @click="onLeftNavClick">&lt;</el-button>
    </el-aside>
    <el-main ref="main" class="navsMain">
      <div ref="buzNavs" class="buzNavs">
        <FacilityButton
          v-for="item in buttonItems"
          v-bind="item"
          @click="typeClick(item, $event)" ></FacilityButton>
      </div>
    </el-main>
    <el-aside v-show="showNav" class="aside" style="width: 22px;">
      <el-button class="nav" @click="onRightNavClick">&gt;</el-button>
    </el-aside>
  </el-container>
</template>

<script>
import {FACILITIES_TYPES_ALL} from '@/common/constants'
import {getStyle,debounce} from '@/utils/cmp'

import FacilityButton from './FacilityButton'

export default {
  name: 'map-tool-buttons',
  components: {
    FacilityButton: FacilityButton,
  },
  props: {
    bus:{}
  },
  data(){
    return {
      showNav: false,
      leftHideCount: 0,
      btnWidths:[],
      mainWith: 0,
      // types: FACILITIES_TYPES_ALL,
      checks: {},
    }
  },
  computed: {
    hiddenWidth(){
      return 1140 - this.mainWith;//1140=Object.keys(FACILITIES_TYPES_ALL).length * 95
    },
    buttonItems(){
      const allTypes = FACILITIES_TYPES_ALL;
      const items = [];
      for(var k in allTypes){
        let type = allTypes[k]
        items.push({
          key: type.value,
          label: type.name,
          value: this.checks[k],
          k
        })
      }
      return items;
    },
  },
  methods:{
    typeClick(item, check){
      const checks = {...this.checks};
      checks[item.k] = check ? 'on': 'off';
      this.checks = checks
      const type = FACILITIES_TYPES_ALL[item.k]
      this.$emit('typeClick', {type, check})
    },
    resetByType(type){
      const allTypes = FACILITIES_TYPES_ALL;
      for(var k in allTypes){
        let tmpType = allTypes[k]
        if(tmpType.value == type.value){
          const checks = {...this.checks};
          checks[k] = 'off';
          this.checks = checks
          break;
        }
      }
    },
    updateShowNav(){
      const width = parseFloat(getStyle(this.$refs.container.$el, "width"));
      this.showNav = width < 1140;

      this.mainWith = parseFloat(getStyle(this.$refs.main.$el, "width"));
    },

    onRightNavClick(){
      // this.$refs.buzNavs.style.transform =
      const marginLeft = 10;
      const count = this.leftHideCount + 1;
      const btnWidths = this.btnWidths;
      let width = -1 * marginLeft;//第一个没有marginLeft
      width = 0;
      for(var i=0; i<count; i++){
        width += btnWidths[i] + marginLeft;
      }
      if(width - btnWidths[i] - marginLeft > this.hiddenWidth){
        return;
      }
      this.$refs.buzNavs.style.transform = `translate(${-width}px, 0)`;
      this.leftHideCount = count;
    },
    onLeftNavClick(){
      if(this.leftHideCount == 0)return;
      const marginLeft = 10;
      const count = this.leftHideCount - 1;
      const btnWidths = this.btnWidths;
      let width = -1 * marginLeft;//第一个没有marginLeft
      width = 0;
      for(var i=0; i<count; i++){
        width += btnWidths[i] + marginLeft;
      }
      this.$refs.buzNavs.style.transform = `translate(${-width}px, 0)`;
      this.leftHideCount = count;
    }
  },
  mounted(){
    this.updateShowNav();

    this._onResize = debounce(()=>this.updateShowNav(),300);
    window.addEventListener('resize', this._onResize);

    const nodes = this.$refs.buzNavs.childNodes;
    for(var i=0,len=nodes.length; i<len; i++){
      var node = nodes[i];
      if(node.nodeType == 1){
        var width = Math.ceil(parseFloat(getStyle(node, "width")));
        this.btnWidths.push(width);
      }
    }
    const type_no_item = ({type})=>this.resetByType(type);
    this.type_no_item = type_no_item
    this.bus.$on('type_no_item', type_no_item)
    // console.log(this.btnWidths);
  },
  updated(){

  },
  destroyed(){
    window.removeEventListener('resize', this._onResize);
    this.bus.$off('type_no_item', this.type_no_item)
  }
}
</script>

<style scoped>
.toolButtons{
  height: 80px;
  overflow: hidden;
  width: 100%;
}
.navsMain{
  padding: 0;
  overflow: hidden;
}
.buzNavs{
  overflow: hidden;
  white-space: nowrap;
  width: 1140px;
  transition: transform 0.5s;
}
.nav{
  padding: 12px 5px;
}
</style>
