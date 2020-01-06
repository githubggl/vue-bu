<template>
  <el-form
    :model="saveForm"
    :rules="rules"
    ref="saveForm"
    size="mini"
    class="mapLocation"
    :class="formClass"
    :label-width="labelWidth"
    :validate-on-rule-change="false">
    <el-form-item label="地址" prop="address" style="width:100%;">
        <el-tooltip :disabled="edit" :content="saveForm.address" placement="right" effect="light">
          <el-input
            :readonly="readonly"
            class="mdp-input"
            type="text"
            :placeholder="addressPlaceHolder"
            v-model="saveForm.address">
          </el-input>
        </el-tooltip>
    </el-form-item>
    <el-form-item label="经度" prop="lng" class="" style="width:100%;">
      <el-input
        :readonly="readonly"
        class="mdp-input"
        type="text"
        :placeholder="lngPlaceHolder"
        @change="onLngChange"
        v-model="saveForm.lng">
      </el-input>
    </el-form-item>
    <el-form-item label="纬度" prop="lat" class="" style="width:100%;">
      <el-input
        :readonly="readonly"
        class="mdp-input"
        type="text"
        :placeholder="latPlaceHolder"
        @change="onLatChange"
        v-model="saveForm.lat">
      </el-input>
    </el-form-item>
    <el-form-item style="text-align: right;">
      <el-button v-if="edit" type="primary" @click="onSaveClick" class="map-button">提交</el-button>
      <el-button v-if="edit" @click="onMarkClick" class="map-button">选点</el-button>
      <el-button @click="onViewLocationClick" class="map-button">定位</el-button>
    </el-form-item>
  </el-form>
</template>

<script>

export default {
  name: 'mark-detail-pane',
  props: {
    edit: {
      type: Boolean,
      default: false
    },
    latlng:{
      type: Object
    },
    address:{
      type: String,
      default: '',
    },
    store: Object,
  },

  data(){
    const latlng = this.latlng
    const address = this.address

    // 经度范围：-180~180
    // 纬度范围：-90~90
    const lngValidator = (rule, value, callback) => {
        if(value){
            if(/^(\-|\+)?(((\d|[1-9]\d|1[0-7]\d|0{1,3})\.\d+)|(\d|[1-9]\d|1[0-7]\d|0{1,3})|180\.0+|180)$/.test(value)){
                callback()
            }else{
                callback('无效的经度')
            }
        }else{
            callback();
        }
    };
    const latValidator = (rule, value, callback) => {
        if(value){
            if(/^(\-|\+)?([0-8]?\d{1}\.\d+|90\.0+|[0-8]?\d{1}|90)$/.test(value)){
                callback()
            }else{
                callback('无效的纬度')
            }
        }else{
            callback();
        }
    };
    return {
      saveForm: {
        lat: latlng.lat,
        lng: latlng.lng,
        address
      },
      rules: {
          lat:[
            {  validator: latValidator, trigger: 'change' },
          ],
          lng:[
            {  validator: lngValidator, trigger: 'change' },
          ],
      },
    }
  },
  computed: {
    readonly(){
      return !this.edit
    },
    formClass(){
      return {'mdp-detail': !this.edit}
    },

    addressPlaceHolder(){
      return this.edit ? '请输入地址': ''
    },
    lngPlaceHolder(){
      return this.edit ? '请输入经度': ''
    },
    latPlaceHolder(){
      return this.edit ? '请输入纬度': ''
    },
    // addressTooltipDisabled(){
    //   return !this.edit
    // },

    labelWidth(){
      return (this.store || this.$store).state.isBigScreen ? '150px': '50px'
    },
  },
  methods: {

    onSaveClick(){
      this.$emit("onAction", {type: 'onSaveClick', form: this.saveForm})
    },
    onMarkClick(){
      this.$emit("onAction", {type: 'onStartMarkClick', form: this.saveForm})
    },
    onViewLocationClick(){
      this.$emit("onAction", {type: 'onViewLocationClick', form: this.saveForm})
    },

    onLngChange(){
        this.$refs.saveForm.validateField('lng', errorMessage=>{
            if(!errorMessage){
                this.$emit("onAction", {type: 'onLatLngChange', form: this.saveForm})
            }
        })
    },
    onLatChange(v){
        this.$refs.saveForm.validateField('lat', errorMessage=>{
            if(!errorMessage){
                this.$emit("onAction", {type: 'onLatLngChange', form: this.saveForm})
            }
        })
    },

  },

  watch: {
    latlng(latlng){
      const address = this.saveForm.address
      this.saveForm = {
        lat: latlng.lat,
        lng: latlng.lng,
        address
      }
    },
    address(address){
      const {lat,lng} = this.saveForm
      this.saveForm = {
        lat,
        lng,
        address
      }
    }
  },

  // mounted(){
  //
  // },
  //
  // destroyed(){
  //
  // }
}
</script>
<style>
.mapLocation.mdp-detail .el-form-item--mini.el-form-item{
  margin-bottom: 5px;
}
.mapLocation.mdp-detail .el-input__inner{
  border: none;
}
</style>
<style scoped>
.mapLocation{
  background: #FFF;
}
</style>
