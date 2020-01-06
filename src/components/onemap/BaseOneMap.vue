<template>
    <div class="baseMap">
      <BaseMap @loadMapOver="loadMapOver"/>
      <ToolButtons @typeClick="onTypeButtonClick" class="toolButtons"/>
      <div class="toggleRightContainer"><el-button @click="onToggleRight" type="primary">{{toggleLabel}}</el-button></div>
      <RangeSearch :map="map" @onCreateShape="onCreateShape" class="drawContainer"/>
    </div>
</template>

<script>

import BaseMap from '@/components/map/BaseMap'
import ToolButtons from './toolButtons'
import RangeSearch from './controls/RangeSearch'

import bus from './bus'

export default {
  name: 'base-one-map',
  components: {
    ToolButtons,
    RangeSearch,
    BaseMap,
  },

  data(){
    return {
      bus: bus,
      toggleLabel: '常态',
      toggleValue: 0,
      map: null,
    }
  },
  // computed: {
  // },
  methods: {

    onToggleRight(){
      let value = this.toggleValue + 1;
      const status = ['常态','非常态'];
      if(status.length == value){
        value = 0;
      }
      this.toggleValue = value;
      this.toggleLabel = status[value];
      // this.$emit('toggleRight', {value});
      this.$emit("onAction", {type: 'onToggleRight', payload: {value}})
    },

    loadMapOver(payload){
      payload.bus = this.bus
      this.map = payload.map;
      this.$emit("onAction", {type: 'loadMapOver', payload})
    },

    onTypeButtonClick(payload){
      this.$emit('onAction', {type: 'onTypeButtonClick', payload})
    },

    onCreateShape(payload){
      this.$emit('onAction', {type: 'onCreateShape', payload})
    }
  },
//
  mounted(){

  },

  destroyed(){
    // console.log('onemap destroyed');
    this.map = null
    this.bus.destroyBus();
    this.bus = null;
  }
}
</script>
<style scoped>
.baseMap{
  position: relative;
}
.toolButtons{
  position: absolute;
  bottom: 10px;
  z-index: 1000;
}
.marker{
  width: 200px;
}
.taskAssignment .leaflet-popup-content{
  margin: 0;
}
.toggleRightContainer{
  position: absolute;
  z-index: 1000;
  top: 12px;
  right: 15px;
}
.drawContainer{
  position: absolute;
  z-index: 1000;
  top: 12px;
  left: 55px;
  background: #FFF;
  padding: 5px;
}
</style>
