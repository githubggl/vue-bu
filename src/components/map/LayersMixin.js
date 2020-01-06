export default {
  data(){
    return {
      layers: {},
      L: window.L,
    }
  },

  methods: {
    getLayer(key, create){
      let layer = this.layers[key];
      if(!layer && (create !== false)){
        this.layers[key] = layer = this.L.featureGroup();
      }
      return layer
    },
    markShowLayer(layer){
      layer.showing = true
    },
    hideLayer(layer){
      layer.closePopup();
      layer.clearLayers();
      layer.showing = false;
    },
    hideLayerByKey(key){
      let layer = this.getLayer(key, false)
      if(!layer) return
      this.hideLayer(layer)
    },
    layerIsShowing(layer){
      return layer && layer.showing
    },
    layerIsShowingByKey(key){
      return this.layerIsShowing(this.getLayer(key, false))
    },

  }
}
