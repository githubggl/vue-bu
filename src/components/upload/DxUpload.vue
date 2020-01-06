<template>
  <el-upload
    class="dx-uploader el-upload--text"
    :action="action"
    :accept="accept"
    :headers="uploadRequestHeader"
    :data="uploadRequestData"
    :show-file-list="false"
    :file-list="fileList"
    :on-progress="uploadProcess"
    :on-success="uploadSuccess"
    :before-upload="beforeUpload"
    >

    <div class='inlineBox imgsBox' v-show="!!fileList.length">
      <DxUploadImgBox
        v-for="(item,i) in fileList"
        :key="'ul_img_'+i"
        :item="item"
        @delete="deleteImg"
        :data="i"
        class="uploadImg"/>
    </div>

    <div :class='[styles]' v-loading="isuploading" class='inlineBox addNewBox' slot="trigger">
      <i v-if="!isuploading" class="el-icon-plus dx-uploader-icon"></i>
    </div>

  </el-upload>
</template>

<script>
import FloatingPane from '@/components/common/FloatingPane'
import AudioPlayer from '@/components/common/AudioPlayer'
import VideoPlayer from '@/components/common/VideoPlayer'
import DxUploadImgBox from './DxUploadImgBox'

import { fileType, mediaMineType, imgMineTypes } from '@/utils/cmp'
import {uploadApi} from '@/common/constants'

import { contentItemToFileItem, contentArrToFileList } from '@/store/attachment'

export default {
  components: { DxUploadImgBox, FloatingPane, VideoPlayer, AudioPlayer},
  name: 'dx-upload',
  props: {
    dirName: {
      type: String,
      default: 'jgt',
    },
    value: {
      type: Array,
      default: ()=>[]
    },
    quantity:{
      type: Number,
      default: Infinity,
    },

    media:{
      type: Boolean
    },
    acceptMineTypes: Array,
    imgOnly: Boolean,
  },

  model: {
    prop: 'value',
    event: 'change'
  },
  data() {
    return {
      styles: 'toShow',
      action: uploadApi,

      fileList: [],

      isuploading: false,
      uploadPercent: 0,

    }
  },
  computed: {
    uploadRequestHeader(){
      const token = this.$store.state.login.token || {}
      const headers = {}
      const tk = token.tokenHeaderName, tv = token.value;
      if(tk && tv){
        headers[tk] = tv
      }
      return headers
    },
    uploadRequestData(){
      return {
        dirName: this.dirName
      }
    },
    allAcceptMineTypes(){
      const types = []
      if(this.imgOnly){
        types.push(...imgMineTypes)
      }else{
        if(this.acceptMineTypes){
          types.push(...this.acceptMineTypes)
        }
        if(this.media){
          types.push(...mediaMineType)
        }
      }
      return types
    },
    accept(){
      return this.allAcceptMineTypes.join(',')
    },
  },
  methods:{
    deleteImg(index){
      this.$confirm('确定要删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.fileList.splice(index, 1)
        this.styles = this.fileList.length < this.quantity ? 'toShow' : 'hide'
        this.$emit('change', this.fileList.map(({meta})=>meta))
      })
    },
    beforeUpload (file) {
        // const isLt20M = file.size / 1024 / 1024 < 20;
        // if (['video/mp4'].indexOf(file.type) == -1) { //'video/ogg', 'video/flv', 'video/avi', 'video/wmv', 'video/rmvb'
        //     this.$message.error('请上传正确的视频格式');
        //     return false;
        // }
        // if (!isLt20M) {
        //     this.$message.error('上传视频大小不能超过20MB哦!');
        //     return false;
        // }
        if(this.allAcceptMineTypes.length && this.allAcceptMineTypes.indexOf(file.type) == -1){
          this.$message.error('请上传正确的文件格式');
          return false;
        }
        this.isuploading = true
    },
    uploadProcess(event, file, fileList){
      this.uploadPercent = +file.percentage.toFixed(0)
    },
    uploadSuccess(res, file){
      // console.log('res=',res);
      if(!res || !res.saveMode){
          this.$message.error('上传失败，请重新上传！');
        return;
      }
      const item = contentItemToFileItem({item: res, i: res.originalFileName, icon: true})
      this.fileList.push(item)

      this.styles = this.fileList.length < this.quantity ? 'toShow' : 'hide'
      this.isuploading = false
      this.uploadPercent = 0;
      this.$emit('change', this.fileList.map(({meta})=>meta))
    },

    updateFileList(value){
      const fileList = contentArrToFileList({content: value, icon: true})
      this.fileList = fileList
      this.styles = fileList.length < this.quantity ? 'toShow' : 'hide'
    },

  },

  // activated(){
  // },
  //
  // deactivated(){
  //
  // },

  mounted(){
    this.updateFileList(this.value || [])
  },

  watch:{
    value(value){
      this.updateFileList(value || [])
    }
  }
}
</script>

<style scoped>

.inlineBox{
  display: inline-block;
}
.imgsBox{
  vertical-align: top;
  height: 100px;
  position: relative;
}
.uploadImg{
  width: 100px;
  height: 100%;
}
.addNewBox{
  float: right;
  width: 98px;
  height: 98px;
}
.progress{
  margin-top: 10px;
}
.dx-uploader{
  line-height: 0;
}
.dx-uploader .addNewBox {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.dx-uploader .addNewBox:hover {
  border-color: #409eff;
}
.el-form-item.is-error .addNewBox{
  border-color: #F56C6C;
  border-style: solid;
}
.dx-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}
.toShow{
  display:inline-block;
}
.hide{
  display:none;
}

.playerPane{
  width: 400px;
}
</style>
