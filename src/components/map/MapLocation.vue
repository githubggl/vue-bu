<template>
  <el-dialog
    custom-class="map-location"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :title="title"
    :visible.sync="visible"
    :append-to-body="true"
    :width="width"
    top="8vh"
  >
    <div class="markerMap">
      <BaseMap v-if="showMap" @loadMapOver="_loadMapOver" :init-center="center" :style="mapStyle"/>
    </div>
    <MarkDetailPane v-show="this.map" :edit="edit" :latlng="latlng" :address="address" @onAction="onAction" class="detailPane" :store="storeObj"/>
  </el-dialog>
</template>

<script>

import BaseMap from './BaseMap'
import MarkDetailPane from './MarkDetailPane'

import fetch from '@/utils/fetch'
import { tiandituKey } from '@/common/constants'

export default {
  name: 'map-location',
  components: {
    BaseMap,
    MarkDetailPane
  },

  data(){
    return {
      visible: false,

      L: window.L,
      map: null,
      edit: false,
      showMap: false,

      latlng: {
        lng: '',
        lat: '',
      },
      address: '',

      markerRadius: 5,
      marker: null,//标注点
      gifMarker: null,

      locationMark: null,
      defaultCenter: null,
      defaultZoom: 0,

      loadAddressCount: 0,
    }
  },
  computed: {
    center(){
      return this.hasLngLat && [this.latlng.lat, this.latlng.lng] || null
    },
    hasLngLat(){
      const latlng = this.latlng
      return latlng && (latlng.lng != '' || latlng.lat != '')
    },
    mapStyle(){
      if(this.locationMark){
        return {
          cursor: 'pointer'
        }
      }
      return null
    },
    title(){
      return this.edit ? '地图标注': '位置查看'
    },
    storeObj(){
      return (this.$store || this.store)
    },
    width(){
      return this.storeObj.state.isBigScreen ? '1800px': '800px'
    },
  },
  methods: {
    show(edit, address, lng, lat, callback){
      this.visible = true
      this.showMap = true;
      this.edit = edit;

      address = address || ''
      lng = lng || ''
      lat = lat || ''

      this.latlng = {
        lng,
        lat
      }
      this.address = address
      // console.log('latlng:',this.latlng);
      if(this.map){
        if(this.hasLngLat){
          const latlng = this.L.latLng(lat, lng)
          this.map.flyTo(latlng)
          this.addLocationMarker(latlng)
          if(!edit){
            this.addViewLocationMarker(latlng)
          }
        }else {
          this.map.setView(this.defaultCenter, this.defaultZoom)
        }
      }
      if(edit){
        this.callback = callback
      }
    },
    hide(){
      this.visible = false
    },

    onAction({type, form}){
      if(this[type]){
        this[type](form)
      } else {
        console.log('unknown action: '+type);
      }
    },

    onLatLngChange(form){
        console.log('onLatLngChange', form);
        let lat = form.lat, lng = form.lng
        if(!lat || !lng)return
        const map = this.map
        if(!map)return
        const latlng = this.L.latLng(lat, lng)
        map.flyTo(latlng)
        this.addLocationMarker(latlng)
        this.loadLatlngAddress(latlng)
    },

    onSaveClick(form){
      if(this.callback){
        try{
          this.callback({...form})
        }catch(e){
          console.log(e);
        }
      }else {
        console.log('地图标注缺少回调函数');
      }
      this.visible = false
    },

    onStartMarkClick(form){
      if(this.marker){
        this.map.removeLayer(this.marker)
        this.marker = null;
      }
      if(this.gifMarker){
        this.map.removeLayer(this.gifMarker)
      }
      if(this.locationMark){
        return;
      }
      this.locationMark = {};
      // this._updateRadius();
      this.locationMark.mousemove = e => {
        const locationMark = this.locationMark
        let circle = locationMark.circle
        if(circle){
          circle.setLatLng(e.latlng)
        } else {
          locationMark.circle = circle = this.L.circleMarker(e.latlng, {radius: this.markerRadius});
          circle.addTo(this.map);
        }
      };
      this.locationMark.click = e=>{
        const latlng = e.latlng
        this.latlng = {
          lat: latlng.lat,
          lng: latlng.lng,
        }
        this.addLocationMarker(latlng);
        this.loadLatlngAddress(latlng)
        this._clearMarking();
      };
      // this.locationMark.zoom = e => {
      //   this._updateRadius();
      // };
      // this.map.on('zoom', this.locationMark.zoom)
      this.map.on('mousemove', this.locationMark.mousemove)
      this.map.on('click', this.locationMark.click)
    },

    _clearMarking(){
      const locationMark = this.locationMark
      let circle = locationMark.circle
      if(circle){
        this.map.removeLayer(circle)
        // this.map.off('zoom', this.locationMark.zoom)
        this.map.off('mousemove', this.locationMark.mousemove)
        this.map.off('click', this.locationMark.click)
      }
      this.locationMark = null;
    },
    // _updateRadius(){
    //   // const map = this.map
    //   // const bounds = map.getBounds()
    //   // this.markerRadius = map.distance(bounds.getNorthEast(),bounds.getNorthWest()) / map.getSize().x * 5
    //   // if(this.locationMark && this.locationMark.circle){
    //   //   this.locationMark.circle.setRadius(this.markerRadius)
    //   // }
    //   this.markerRadius = 5;
    // },

    onViewLocationClick(form){
      const hasLngLat = (form.lng != '' || form.lat != '')
      if(!hasLngLat)return
      const latlng = this.L.latLng(form.lat, form.lng)
      this.addViewLocationMarker(latlng)
      this.map.flyTo(latlng)
    },

    addViewLocationMarker(latlng){
      let gifMarker = this.gifMarker
      if(gifMarker){
        gifMarker.setLatLng(latlng)
      }else{
        this.gifMarker = gifMarker  = this.L.marker(latlng, {
          icon: this.L.icon({
            iconUrl: '/static/images/red_glow.gif',
            iconSize: [48, 48],
            iconAnchor: [24, 24],
            popupAnchor: [0, 0],
          })
        });
      }
      gifMarker.addTo(this.map)
    },

    addLocationMarker(latlng){
      if(this.marker){
        this.marker.setLatLng(latlng)
        this.marker.addTo(this.map)
        return;
      }
      const marker = this.L.circleMarker(latlng, {
        radius: 5,
        fill: true,
        fillColor: '#FF0000',
        fillOpacity: 1,

        weight: 2,
      });
      marker.addTo(this.map)
      this.marker = marker;
    },

    loadLatlngAddress(latlng){
        const loadAddressCount = this.loadAddressCount+1
        fetch(`//api.tianditu.gov.cn/geocoder?postStr={'lon':${latlng.lng},'lat':${latlng.lat},'ver':1}&type=geocode&tk=${tiandituKey}`).then(response=>{
            const loadAddressCount2 = this.loadAddressCount
            if(loadAddressCount2 != loadAddressCount)return
            const status = response.status;
            if(status == 200){
                return response.json()
            }else{
                console.error(status, response);
            }
        }).then(data=>{
            let address
            if(data){
                try{
                    if(data.msg =="ok"){
                        address = data.result.formatted_address
                    }
                }catch(e){
                    console.error(e);
                }
                if (address) {
                    this.address = address
                }
            }
        });
        this.loadAddressCount = loadAddressCount
    },

    _loadMapOver({map}){
      this.map = map
      this.defaultCenter = map.getCenter();
      this.defaultZoom = map.getZoom();

      if(this.hasLngLat){
        const latlng = this.L.latLng(this.latlng.lat, this.latlng.lng)
        map.flyTo(latlng)
        this.addLocationMarker(latlng)
        if(!this.edit){
          this.addViewLocationMarker(latlng)
        }
      }
    }
  },

  watch:{
    visible(visible){
      if(!visible){
        if(this.gifMarker){
          this.map.removeLayer(this.gifMarker)
        }
        if(this.marker){
          this.map.removeLayer(this.marker)
        }
        if(this.locationMark){
          this._clearMarking()
        }
        this.latlng = {};
        this.address = null;
      }
    }
  },

  created(){

  },

  destroyed(){
    this.gifMarker = null;
    this.marker = null;
    this.map = null;
    this.L = null;
  }
}
</script>
<style>
.map-location .el-dialog__body{
  position: relative;
}
</style>
<style scoped>
.markerMap{
  height: 500px;
}
.isBigScreen .markerMap{
  height: 1200px;
}
.detailPane{
  position: absolute;
  right: 20px;
  top: 10px;
  z-index: 1000;
}
.marking{
  cursor: pointer;
}
</style>
