<template>
  <div class="menu-wrapper">
    <template v-for="(item,index) in menus">
      <!-- 最后一级菜单 -->
      <!-- @click="gotoRoute(item.code)" -->
      <el-menu-item
        v-if="!item.children"
        :key="item.code"
        :index="item.code"
        class="menuItem"
        style="padding-left:70px;"
      >
        <div slot="title" :class="itemTitleClass(index)">{{ item.name }}</div>
      </el-menu-item>

      <!-- 此菜单下还有子菜单 -->
      <el-submenu
        v-if="item.children"
        :key="item.code"
        :index="item.code"
        class="subMenu"
      >
        <template v-slot:title>
          <img v-show="item.config.icon" :src="'/static/images/menu/'+item.config.icon" class="menu-icon"/>
          <span class="menu-label"> {{ item.name }}</span>
        </template>
        <!-- 递归 -->
        <!-- @gotoRouteFail="gotoRouteFail" -->
        <!-- :handler="handler" -->
        <sider-menu-items
          :menus="item.children"
        />
      </el-submenu>
    </template>
  </div>
</template>

<script>
//<i :class="item.config.icon"></i>

export default {
  name: "sider-menu-items",
  props: {
    menus: {
      type: Array,
      default: function() {
        return []
      }
    },
    // handler: {
    //   type: Function,
    // }
  },
  methods: {
    // gotoRoute(name) {
    //   if(this.handler){
    //     this.handler(name)
    //   }else{
    //     this.$router.push({ name }, null, e=>{
    //       (e === false) && this.gotoRouteFail();
    //     })
    //   }
    // },
    //
    // gotoRouteFail(){
    //   this.$emit('gotoRouteFail')
    // },

    itemTitleClass(index){
      const len = this.menus.length
      if(index < (len-1)){
        return 'menu-item-label menu-item-has-bottom'
      }
      return 'menu-item-label'
    }
  },

};
</script>

<style scoped>
.menuItem{
  font-size: 17px;
}
.menuItem.is-active::before{
	content:"";
	position:absolute;
	left:45px;
	top:17px;
	background:url(../../assets/menu/images/left_navselect_arrow.png) 0 0 no-repeat;
	width:9px;
	height:14px;

}
.menu-wrapper .menuItem{
  height: 48px;
  line-height: 48px;
  padding: 0 1px;
}
.menu-icon{

}
.menu-label{
  margin-left: 15px;
}
.menu-item-label{
  padding-left: 7px
}
.menu-item-has-bottom{
  border-bottom: 1px solid #1d4a63;
  line-height: 47px;
}
</style>
