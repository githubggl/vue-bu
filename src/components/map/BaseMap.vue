<template>
  <div style="height: 100%;" ref="mapkey"></div>
</template>

<script>
// @ is an alias to /src
import 'leaflet';

import '@supermap/iclient-leaflet';
// import '@supermap/iclient-leaflet/dist/iclient9-leaflet.min.css';

import 'leaflet-draw'
// import "leaflet-draw/dist/leaflet.draw.css";

import {snowMapBaseLayerUrl, tiandituKey, mapCenter, mapZoom, maxZoom} from '@/common/constants'

import when from '../utils/when'

export default {
  name: 'basemap',
  // components: {},

  props: {
    initMap: {
      type: Boolean,
      default: true,
    },
    initCenter: {
      type: Array
    },
    initZoom: {
      type: Number
    },
    zoomControl:{
      type: Boolean,
      default: true,
    },

    mapOptions: {},
  },

  data(){
    return {
      L: window.L,
      map: null,
      layer: null,//底图图层
      mapUrl: snowMapBaseLayerUrl,
    }
  },
  computed: {
    // ...mapGetters(['menuData'])
  },
  methods: {
    loadMap(){//天地图
      this.loadMap_tianditu();
      // this.loadMap_snow_supermap();
      this.initDebugMapInfo()
    },

    getOptions(){
      const options = {};
      const mapOptions = this.mapOptions
      if(mapOptions){
        for(var k in mapOptions){
          options[k] = mapOptions[k]
        }
      }
      if(!options.crs){
        options.crs = L.CRS.EPSG4326
      }
      if(!options.center){
        options.center = this.initCenter || mapCenter
      }
      if(!options.maxZoom){
        options.maxZoom = maxZoom
      }
      if(!options.zoom){
        options.zoom = this.initZoom || mapZoom
      }
      if(!options.zoomControl){
        options.zoomControl = false
      }
      return options
    },

    loadMap_tianditu(){
      const L = this.L;
      const key = tiandituKey;
      const options = this.getOptions();
      this.map = L.map(this.$refs.mapkey, options);
      if(this.zoomControl){
        L.control.zoom({
           zoomInTitle :'放大',
           zoomOutTitle :'缩小',
        }).addTo(this.map);
      }
      let layer;
      this.layer = layer = L.supermap.tiandituTileLayer({
        url: `http://t{s}.tianditu.com/{layer}_{proj}/wmts?tk=${key}`,
        layerType: 'img'
      });
      layer.addTo(this.map);

      const layerOptions = {
          maxZoom: options.maxZoom
      }

      layer = L.supermap.tiledMapLayer(this.mapUrl, layerOptions);
      layer.addTo(this.map);

      L.supermap.tiandituTileLayer({
          isLabel: true,
          layerType: 'img',
          url: `http://t{s}.tianditu.com/{layer}_{proj}/wmts?tk=${key}`,
      }).addTo(this.map);

      this.$emit("loadMapOver", {map: this.map});
    },

    loadMap_snow_supermap() {
      const L = this.L;
      this.map = L.map(this.$refs.mapkey, {
        crs: L.CRS.EPSG4326,
        center: this.initCenter || mapCenter,
        zoom: this.initZoom || mapZoom,
        zoomControl: false,
      });
      if(this.zoomControl){
        L.control.zoom({
           zoomInTitle :'放大',
           zoomOutTitle :'缩小',
        }).addTo(this.map);
      }
      this.layer = L.supermap.tiledMapLayer(this.mapUrl);
      this.layer.addTo(this.map);
      this.$emit("loadMapOver", {map: this.map});
    },

    initDebugMapInfo(){
      if(process.env.NODE_ENV !== 'production'){
        window.see = {};
        see.map = this.map;
        see.ps = []
        this.map.on("mousedown", e => {
          const latlng = e.latlng
          console.log('latlng=',JSON.stringify(latlng));
          console.log('lnglat=',JSON.stringify([latlng.lng, latlng.lat]));
          see.ps.push([latlng.lat, latlng.lng])
        });
      }
    },
  },
//
  mounted(){
    if(this.initMap){
      this.loadMap();
    }else{
      // debugger
      when(this, 'initMap', 'loadMap')
    }
  },

  destroyed(){
    // console.log('onemap destroyed');
    this.map.remove();
    this.map = null;
  }
}
</script>
