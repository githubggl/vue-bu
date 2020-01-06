<template>
  <div v-show="visible" class="floating-pane">
    <div
      class="title"
      @mousedown="_onMouseDown"
      @mouseup="_onMouseUp"
      >
      <slot name="title">
        <span class="title-label">{{title}}</span>
      </slot>
      <slot name="close">
        <el-button type="text" @click.stop.prevent="onCloseClick" icon="el-icon-close" class="close"></el-button>
      </slot>
    </div>
    <div class="floating-container">
      <slot></slot>
    </div>
  </div>
</template>

<script>

// @mousemove="_onMouseMove"
import {getStyle} from '@/utils/cmp'

export default {
  // components: {},

  props: {
    title: String,
    visible: Boolean,
    top: Number,
    left: Number,
    center: Boolean,
    appendToBody: Boolean,
  },

  data() {
    return {
      px: 0,
      py: 0,

      x: 0,
      y: 0,

      mousedown: false,
    }
  },

  // computed:{
  //   style(){
  //     // getStyle(this.$el, 'marginLeft')
  //     return {
  //       top: `${this.t}px`,
  //       right: `${this.r}px`,
  //     }
  //   }
  // },

  methods: {
    onCloseClick(e){
      this.$emit('update:visible', false)
      this.$emit('close', true)
    },
    _onMouseDown(e){
      // console.log('_onMouseDown', e);
      this.px = e.pageX
      this.py = e.pageY
      this.x = this.$el.offsetLeft
      this.y = this.$el.offsetTop
      this.mousedown = true
      document.addEventListener('mousemove', this.onMouseMove)
      this.$emit('down')
    },
    _onMouseMove(e){
      // console.log('_onMouseMove', e);
      if(!this.mousedown)return
      const px = e.pageX
      const py = e.pageY

      const left = this.x + px - this.px
      const top = this.y + py - this.py

      this.$el.style.left = left + 'px'
      this.$el.style.top = top + 'px'
      this.$emit('move')
    },
    _onMouseUp(e){
      // console.log('_onMouseUp', e);
      this.mousedown = false
      document.removeEventListener('mousemove', this.onMouseMove)
      this.$emit('up')
    },

    autoCenter(){
      //获取可见窗口大小
      var bodyW = document.documentElement.clientWidth;
      var bodyH = document.documentElement.clientHeight;
      //获取对话框宽、高
      const el = this.$el
      var elW = el.offsetWidth;
      var elH = el.offsetHeight;

      el.style.left = (bodyW - elW)/2 + 'px';
      el.style.top = (bodyH - elH)/2 + 'px';
    },
  },

  watch: {
    visible(visible){
      if(visible){
        if(this.center){
          this.$nextTick(()=>{
            this.autoCenter()
          });
        }
      }
    }
  },

  mounted(){
    // const h = (e)=>{
    //   this._onMouseMove(e);
    // }
    // document.addEventListener('mousemove', h);
    // this.$on('hook:beforeDestroy', ()=>{
    //   document.removeEventListener('mousemove', h);
    // })
    if(this.appendToBody){
      this.$el.ownerDocument.body.appendChild(this.$el)
    }
    if(this.visible && this.center){
      this.autoCenter()
    }
    if(this.top){
      this.$el.style.top = this.top + 'px'
    }
    if(this.left){
      this.$el.style.left = this.left + 'px'
    }

    this.onMouseMove = e=>this._onMouseMove(e)
  },

  beforeDestroy(){
    if(this.appendToBody){
      this.$el.parentNode.removeChild(this.$el)
    }
  },
}
</script>

<style scoped>
  .floating-pane{
    position: absolute;
    /*top: 10px;
    right: 10px;*/
    background: #fff;
    color: #409EFF;
    text-align: left;
  }
  .title{
    cursor: move;
    user-select: none;
    position: relative;
  }
  .title *{
    cursor: move;
  }
  .title-label{
    line-height: 40px;
  }
  .close{
    position: absolute;
    right: 0;
    top: 0;
    cursor: pointer;
    padding: 5px;
    font-size: 44px;
  }

  @media screen and (max-width: 1920px)  {
      .close{
          font-size: 16px;
      }
  }
</style>
<style>
.floating-pane .title label{
  cursor: move;
}
</style>
