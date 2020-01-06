<template>
    <div class="plotting">
      <div class="title">基本标号</div>
      <div class="plottingContainer">
        <div
          v-for="item in items"
          class="plotting-item"
          :title="item.symbolName"
          @click="startPlotting(item)"
        ><img :src="item.img"/></div>
        <div class="plotting-item" @click="cancelPlotting"><img src="/static/images/map/basic/i_pan.png"/></div>
        <div class="plotting-item" @click="clearPlotting"><img src="/static/images/map/basic/i_clear.png"/></div>
      </div>
    </div>
</template>

<script>
// @ is an alias to /src
import { snowMapPlotServerUrl } from '@/common/constants'
import {basics} from '../plotting'

import PlotMixin from '@/components/onemap/mixins/PlotMixin'

export default {
  name: 'map-plotting',
  mixins: [ PlotMixin ],
  data(){
    return {

      items: basics,

    }
  },
  // props:{
  //
  // },
  // computed: {
  //
  // },
  methods: {


    oldinitControl(){
      const L = this.L
      const serverUrl = this.serverUrl
      const map = this.map
      var plottingLayer = L.supermap.plotting.plottingLayer("plot", serverUrl);
      plottingLayer.addTo(map);
      var drawControl = L.supermap.plotting.drawControl(plottingLayer);
      drawControl.addTo(map);
      var editControl = L.supermap.plotting.editControl();
      editControl.addTo(map);

      this.plottingLayer = plottingLayer
      this.drawControl = drawControl
      this.editControl = editControl

      plottingLayer.on('featuresadded', event=>{
        console.log('featureadded', event);
        this.map.doubleClickZoom.enable()
      });
      editControl.on('featuresselected', event=>{
        console.log('featuresselected', event);
        const feature = event.features[0]
        const symbolType = feature.symbolType
        if(symbolType == 34){//文本 注记
          this.$prompt('请输入文字', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputValue: feature.getTextContent()
          }).then(({ value }) => {
            feature.setTextContent(value)
          })
        }
      });


    },
  },


}
</script>
<style scoped>
  .plotting{
    display: flex;
    flex-direction: column;
  }
  .plotting .title{
    flex: 0;
  }
  .plotting .plottingContainer{
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    overflow: auto;
  }
  .plotting .plottingContainer .plotting-item{
    cursor: pointer;
  }
</style>
