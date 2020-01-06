<template>
  <el-popover
    v-if="isMedio"
    width="400"
    trigger="click"
    :value="visible"
    @input="popoverChange"
    class="popover"
  >
    <ImgBox slot="reference"
      :src="item.url"
      :deletable="true"
      @delete="deleteImg"
      :data="data"
      class="upload-img-box"
    />
    <VideoPlayer v-if="isVideo" :meta="item.meta" :stop="stopFlag"/>
    <AudioPlayer v-if="isAudio" :meta="item.meta" :stop="stopFlag"/>
  </el-popover>
  <ImgBox
    v-else
    :src="item.url"
    :deletable="true"
    @delete="deleteImg"
    @click.native="onImageClick"
    class="upload-img-box"
  />
</template>

<script>
import ImgBox from '@/components/common/ContentImgBox'
import AudioPlayer from '@/components/common/AudioPlayer'
import VideoPlayer from '@/components/common/VideoPlayer'

import { fileType } from '@/utils/cmp'
import { downloadMeta } from '@/store/attachment'

export default {
  components: { ImgBox, AudioPlayer, VideoPlayer },
  name: 'dx-upload-img-box',
  props: {
    item: {},
    data: {},
  },

  data() {
    return {
      visible: false,

      stopFlag: null,
    }
  },
  computed: {
    isMedio(){
      return this.isVideo || this.isAudio
    },
    isVideo(){
      return this.item.type == fileType.video
    },
    isAudio(){
      return this.item.type == fileType.audio
    },
  },
  methods:{

    popoverChange(visible){
      this.visible = visible
      this.stopFlag = {}
    },

    onImageClick(){
      const item = this.item
      const type = item.type
      // console.log('item',item);
      if(type == fileType.pic){
        this.$dxBigImg.show(item.url)
      // } else if (type == fileType.audio) {
      //   this.audioVisible = true
      //   this.audioMeta = {...item.meta}
      // } else if (type == fileType.video) {
      //   this.videoVisible = true
      //   this.videoMeta = {...item.meta}
      } else {
        // download(item.meta)
        downloadMeta(item.meta)
      }
    },

    deleteImg(){
      this.$emit('delete', this.data)
    },
  },

  // activated(){
  // },
  //
  // deactivated(){
  //
  // },

  // mounted(){
  //
  // },
  //
  // watch:{
  //
  // }
}
</script>

<style scoped>
  .popover{
    display: inline-block;
  }

  .imgBox.upload-img-box{
    border: 0;
  }
  .popover .upload-img-box{
    width: 100%;
    height: 100%;
  }
</style>
