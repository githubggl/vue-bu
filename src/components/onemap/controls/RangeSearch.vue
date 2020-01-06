<template>
    <div class="rangeSearchContainer">
      <span>范围查询</span>
      <el-button @click="startDraw('Circle')" type="primary" size="mini" round plain>圆形</el-button>
      <el-button @click="startDraw('Rectangle')" type="primary" size="mini" round plain>矩形</el-button>
      <el-button @click="startDraw('Polygon')" type="primary" size="mini" round plain>多边形</el-button>
      <el-button @click="clearDrawSharp" type="primary" size="mini" round plain>清除</el-button>
    </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: 'map-range-search',

  data(){
    return {
      L:window.L,
      draw: {
        drawers:{},
        options:{
          Rectangle:{metric: 'km'}
        },
        drawLayer: null,
        currentDrawer: null,

      }
    }
  },
  props:{
    map: Object,
  },
  computed: {

  },
  methods: {
    startDraw(shape){
      if(this.draw.currentDrawer){
        this.draw.currentDrawer.disable()
      }
      this.clearDrawSharp();
      let drawer = this.draw.drawers[shape]
      if(!drawer){
        const Shape = this.L.Draw[shape];
        if(Shape){
          drawer = new Shape(this.map, this.draw.options[shape])
          this.draw.drawers[shape] = drawer
        } else {
          this.draw.currentDrawer = null;
          console.error('未知图形 >>> ', shape);
          return;
        }
      }
      drawer.enable();
      this.draw.currentDrawer = drawer
    },
    clearDrawSharp(){
      const map = this.map
      if(this.draw.drawLayer){
        map.removeLayer(this.draw.drawLayer)
        this.draw.drawLayer = null
      }
    },

    bindDrawEvents(){
      const self = this;
      this.map.on(this.L.Draw.Event.CREATED, function (e) {
        // e.type will be the type of layer that has been draw (polygon, rectangle, circle)//marker, polyline,
        var type = e.layerType,
            layer = e.layer;
        const map = self.map;

        layer.addTo(map);
        self.draw.drawLayer = layer;
        self.draw.currentDrawer = null;
        const payload = {geoJSON: layer.toGeoJSON()}
        if(type == 'circle'){
          const radius = layer.getRadius();
          payload.radius = radius
        }
        self.$emit("onCreateShape", payload)
        // window.see.layer  = layer
      });
    },
    initDrawTooltips(){
      const handlers = this.L.drawLocal.draw.handlers;
      handlers.circle.tooltip.start = '按下鼠标并移动画圆。'
      handlers.circle.radius = '半径'

      handlers.polygon.tooltip.start = '点击鼠标移动画多边形。'
      handlers.polygon.tooltip.cont = '点击鼠标移动继续画多边形。'
      handlers.polygon.tooltip.end = '点击第一个点来完成画多边形。'

      handlers.polyline.error = '<strong>出错:</strong> 不能构成多边形！'

      handlers.rectangle.tooltip.start = '点击鼠标移动画矩形。'

      handlers.simpleshape.tooltip.end = '释放鼠标完成画图。'
    },
  },

  mounted(){
    console.log('RangeSearch mounted');
    this.initDrawTooltips();
    if(this.map){
      this.bindDrawEvents();
    }else{
      const unwatchFn = this.$watch('map', map=>{
        if(map){
          this.bindDrawEvents();
          unwatchFn();
        }
      })
    }
  }
}
</script>
<style scoped>
</style>
