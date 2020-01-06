import when from '@/components/utils/when'

export default {
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

        drawing: false,
      }
    }
  },
  props:{
    map: {},
  },
  methods: {
    startDrawCircle(){
      this.startDraw('Circle')
    },
    startDrawRectangle(){
      this.startDraw('Rectangle')
    },
    startDrawPolygon(){
      this.startDraw('Polygon')
    },
    startDraw(shape){
      if(this.draw.currentDrawer){
        this.draw.currentDrawer.disable()
      }
      this.clearDrawSharp();
      this.draw.drawing = true
      let drawer = this.draw.drawers[shape]
      if(!drawer){
        const Shape = this.L.Draw[shape];
        if(Shape){
          drawer = new Shape(this.map, this.draw.options[shape])
          this.draw.drawers[shape] = drawer
          if(shape == 'Circle'){
              drawer.owner = this
              drawer._oldOnMouseUp = drawer._onMouseUp
              drawer._onMouseUp = function () {
                  this._oldOnMouseUp()
          		  if (!this._shape) {
          		        this.owner.cancelDrawShape()
          		  }
          	 }
          }
        } else {
          this.draw.currentDrawer = null;
          console.error('未知图形 >>> ', shape);
          return;
        }
      }
      drawer.enable();
      this.draw.currentDrawer = drawer
      this.onStartDraw(shape)
    },
    onStartDraw(shape){},
    cancelDrawShape(){
        if(this.draw.drawing){
          this.draw.drawing = false
          if(this.draw.currentDrawer){
            this.draw.currentDrawer.disable()
          }
          this.onCancelDrawShape()
        }
    },
    onCancelDrawShape(){},
    clearDrawSharp(){
      if(this.draw.drawLayer){
        this.map.removeLayer(this.draw.drawLayer)
        this.draw.drawLayer = null
      }
      this.onClearDrawSharp()
    },

    bindDrawEvents(){
      // const self = this;
      const h = e => {
        // e.type will be the type of layer that has been draw (polygon, rectangle, circle)//marker, polyline,
        var type = e.layerType,
            layer = e.layer;
        const map = this.map;
        const draw = this.draw

        draw.drawing = false
        layer.addTo(map);
        draw.drawLayer = layer;
        draw.currentDrawer = null;
        const payload = {layer, type}
        if(type == 'circle'){
          payload.radius = layer.getRadius()
          payload.center = layer.getLatLng()
      }else{
          payload.latLngs = layer.getLatLngs()
      }
        this.onCreateShape(payload)
        // self.$emit("onCreateShape", payload)
        // window.see.layer  = layer
      };
      this.map.on(this.L.Draw.Event.CREATED, h);

      const contextmenuHandler = event=>this.cancelDrawShape()
      this.map.on('contextmenu', contextmenuHandler);

      this.$once('hook:beforeDestroy', ()=>{
        this.map.off(this.L.Draw.Event.CREATED, h)
        this.map.off('contextmenu', contextmenuHandler)
      });
    },
    onCreateShape(payload){
      this.$emit("onCreateShape", payload)
    },
    onClearDrawSharp(){},
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
    // console.log('RangeSearch mounted');
    this.initDrawTooltips();
    when(this, 'map', 'bindDrawEvents')
  },

  beforeDestroy(){
    if(this.draw.currentDrawer){
      this.draw.currentDrawer.disable()
    }
  },

}
