import { snowMapPlotServerUrl } from '@/common/constants'

import when from '@/components/utils/when'

export default {
  data(){
    return {
      L:window.L,

      plot: {
        serverUrl: snowMapPlotServerUrl,

        plotting: false,
        plottingLayer: null,
        drawControl: null,
        editControl: null,

        // plottingTimer: 0,
      }
    }
  },
  props:{
    map: {},
  },
  methods: {
    startPlottingCircle(){
      this.startPlottingByCode(29)
    },
    startPlottingPloygon(){//多边形
      this.startPlottingByCode(32)
    },
    startPlottingFreeLine(){//自由线
      this.startPlottingByCode(1023)
    },
    startPlottingLine(){//折线
      this.startPlottingByCode(24)
    },
    startPlottingParallelogram(){//平行四边形
      this.startPlottingByCode(28)
    },
    startPlottingSector(){//扇形
      this.startPlottingByCode(380)
    },
    startPlottingBezier(){//贝赛尔曲线
      this.startPlottingByCode(590)
    },
    startPlottingClosedBezier(){//闭合贝赛尔曲线
      this.startPlottingByCode(360)
    },
    startPlottingArrowLine(){//箭头线
      this.startPlottingByCode(1016)
    },
    startPlottingObjectLine(){//对象间连线
      this.startPlottingByCode(1001)
    },
    startPlottingByCode(symbolCode, libID){
      this.startPlotting({
        symbolCode,
        libID,
      })
    },
    startPlotting(item){
      console.log('item:',item);
      this.plot.plotting = true
      this.map.doubleClickZoom.disable()
      const drawControl = this.plot.drawControl

      drawControl.handler.libID = item.libID || 0;
      drawControl.handler.code = item.symbolCode;
      drawControl.handler.serverUrl = this.serverUrl;

      drawControl.handler.disable();
      drawControl.handler.enable();
      this.onStartPlotting(item)
    },
    onStartPlotting(item){},
    cancelPlotting(){
      this.plot.drawControl.handler.disable();
      this.map.doubleClickZoom.enable()
    },
    clearPlotting(){
      this.cancelPlotting();
      this.plot.plottingLayer.removeAllFeatures();
      this.onClearPlotting()
    },
    onClearPlotting(){},
    onEndPlotting(){},
    initControl(){
      if(this.L.supermap.plotting){
        this._initControl()
      }else{
        if(this.plot.plottingTimer){
          return
        }
        const self = this
        this.plottingTimer = setTimeout(function(){
          delete self.plot.plottingTimer
          self.initControl()
        }, 250)
      }
    },
    _initControl(){
      const L = this.L
      const serverUrl = this.plot.serverUrl
      const map = this.map
      var plottingLayer = L.supermap.plotting.plottingLayer("plot", serverUrl);
      plottingLayer.addTo(map);
      var drawControl = L.supermap.plotting.drawControl(plottingLayer);
      drawControl.addTo(map);
      var editControl = L.supermap.plotting.editControl();
      editControl.addTo(map);

      this.plot.plottingLayer = plottingLayer
      this.plot.drawControl = drawControl
      this.plot.editControl = editControl

      plottingLayer.on('featuresadded', event=>{
        // console.log('featureadded', event);
        this.plot.plotting = false
        this.map.doubleClickZoom.enable()
        this.plot.drawControl.handler.disable();
        this.onEndPlotting()
      });
      // editControl.on('featuresselected', event=>{
      //   console.log('featuresselected', event);
      //   const feature = event.features[0]
      //   const symbolType = feature.symbolType
      //   if(symbolType == 34){//文本 注记
      //     this.$prompt('请输入文字', '提示', {
      //       confirmButtonText: '确定',
      //       cancelButtonText: '取消',
      //       inputValue: feature.getTextContent()
      //     }).then(({ value }) => {
      //       feature.setTextContent(value)
      //     })
      //   }
      // });


      const contextmenuHandler = event=>{
        console.log('plot', this.plot);
        if(this.plot.plotting){
          this.plot.plotting = false
          this.plot.drawControl.handler.disable();
          this.map.doubleClickZoom.enable()
          this.onClearPlotting()
        }
      }
      map.on('contextmenu', contextmenuHandler);
      this.$once('hook:beforeDestroy', ()=>{
        this.map.off('contextmenu', contextmenuHandler)
      });
    },
  },

  mounted(){
    when(this, 'map', 'initControl')
  },

  beforeDestroy(){
    if(this.plot.plottingLayer){
      this.map.removeLayer(this.plottingLayer)
      this.map.removeLayer(this.drawControl)
      this.map.removeLayer(this.editControl)
    }
    if(this.plot.plottingTimer){
      clearTimeout(this.plot.plottingTimer)
    }
  },

}
