<template>
  <div ref="container" class="panes-container">
    <slot></slot>
  </div>
</template>

<script>
import {getStyle, debounce, isBigScreen} from '@/utils/cmp'
import heights, { getWeight } from '@/common/heights'

// const _heights = {//key,value 要一样
//   'small': 'small',//1/3
//   'default': 'default',//1/2
//   'big': 'big',//2/3
//   'mini': 'mini',//1/4
//
//   '1_4': '1_4',
//   '1_3': '1_3',
//   '1_2': '1_2',
//   '2_3': '2_3',
// };
// const weights = {//百分比
//   'small': 33,
//   'default': 50,
//   'big': 66,
//   'mini': 25,
//
//   '1_4': 25,
//   '1_3': 33,
//   '1_2': 50,
//   '2_3': 66,
// }
// export const heights = _heights

const removeNode = node=>{
  const parent = node.parentNode
  if(parent){
    parent.removeChild(node)
  }
}
export default {
  name: 'panes-container',
  // components: {
  // },
  props: {
    left: {
      type: Boolean,
      default: true
    }
  },
  data(){
    return {
      heights: {},
      side: 0,//左边或右边距离

      mutiCows: false,
      space: 0,
      border: 0,
    }
  },
  computed: {
    // mutiCows(){
    //   return window.screen.width > 1920
    // },
    // space(){
    //   return this.mutiCows ? 45 : 10
    // },
    // border(){
    //   return this.mutiCows ? 2 : 1
    // },
    // mutiCows(){
    //   return true
    // },
    // space(){
    //   return 10
    // },
    // border(){
    //   return 1
    // },
    cowContainerClass(){
      return this.left ? 'cow-box cow-box-left' : 'cow-box cow-box-right'
    }
  },
  methods: {
    initScreenData(){
      this.mutiCows = isBigScreen()
      this.space = this.mutiCows ? 45 : 10
      this.border = this.mutiCows ? 2 : 1
    },
    updateLayout(){
      this.initScreenData();

      const allDisplayHeight = this.$el.offsetParent.offsetHeight
      this.$el.style.height = 'initial'
      this.$el.style.overflow = 'initial'

      // const heights = _heights
      for(var k in heights){
        this._calcHeight(allDisplayHeight, k)
      }

      if(this.mutiCows){
        this._layoutMutiCols()
      }else{
        this._layoutSingleCol(allDisplayHeight)
      }

      this.$emit('updateLayoutOver', {side: this.side})

// console.log(`${this.left ? 'left': 'right'} allDisplayHeight=${allDisplayHeight}`);
    },

    _layoutMutiCols(){
      // const children = this.$children.slice(0)
      this.side = this.space
      this._layoutMutiCow(0, 0)
    },

    _layoutMutiCow(index, cow){
      const children = this.$children
      if(index >= children.length)return;
      const cowContainer = this.$el.parentNode

      let child, ht, weight, height, width, style
      let i = index, totalWeight = 0, row = 0, top = this.space, side = this.side, maxWidth = 0
      const cs = []
      const isLeft = this.left
      while (i < children.length) {
        child = children[i]
        // ht = child.getHeightType()
        ht = child.constructor.options.height
        // weight = weights[ht] || 0
        weight = getWeight(ht)
        totalWeight += weight
        if(totalWeight > 100){
          totalWeight -= weight
          break
        }

        height = this.heights[ht] || 0
        style = child.$el.style
        style.marginTop = 0
        style.height = `${height}px`
        style.position = 'absolute'
        style.top = `${top}px`
        top += height + this.space
        if(isLeft){
          style.left = `${side}px`
          style.marginLeft = 0
        }else{
          style.right = `${side}px`
          style.marginRight = 0
        }

        cowContainer.appendChild(child.$el)

        width = parseFloat(getStyle(child.$el, 'width'))
        if(width > maxWidth){
          maxWidth = width
        }
        // if(i != index){
        //   child.$el.style.marginTop = `${this.space}px`
        // }
        i++
      }
      this.side += maxWidth + this.space
      // if(i < children.length){
        this._layoutMutiCow(i, cow+1)
      // }
    },

    _layoutSingleCol(allDisplayHeight){
      const children = this.$children
      const len = children.length
      let showAsMuti = false
      let child, ht, weight, totalWeight=0
      if(len <= 3){
        for(let i=0; i < len; i++){
          child = children[i]
          // ht = child.getHeightType()
          ht = child.constructor.options.height
          // weight = weights[ht] || 0
          weight = getWeight(ht)
          totalWeight += weight
        }
        if(totalWeight <= 100){
          showAsMuti = true
        }
      }
      if(showAsMuti){
        this._layoutMutiCols();
      }else{
        const cowContainer = this.$el
        const isLeft = this.left
        let height, style
        for(let i=0; i<len; i++){
          child = children[i]
          // ht = child.getHeightType()
          ht = child.constructor.options.height
          height = this.heights[ht] || 0
          style = child.$el.style
          style.height = `${height}px`
          style.position = 'relative'
          style.top = 0
          // if(i){
            style.marginTop = `${this.space}px`
          // }
          if(isLeft){
            style.marginLeft = `${this.space}px`
            style.left = 0
          }
          else{
            style.marginRight = `${this.space}px`
            style.right = 0
          }
          cowContainer.appendChild(child.$el)
        }

        if(this.$el.offsetHeight > allDisplayHeight){
          this.$el.style.height = `${allDisplayHeight}px`
          this.$el.style.overflow = 'auto'
        }

        const width = parseFloat(getStyle(this.$el, 'width'))
        this.side = width + this.space
      }
    },

    _calcHeight(allDisplayHeight, heightName){
      const name = `_calcHeight_${heightName}`
      if(this[name]){
        const height = this[name](allDisplayHeight)
        if(height && height > 0){
          this.heights[heightName] = height - this.border * 2
        }else{
          console.log(`无效的高度计算结果：${height}, ${heightName}`);
        }
      }else{
        console.log('未实现的高度计算：'+heightName);
      }
    },

    _calcHeight_mini(allDisplayHeight){
      return this._calcHeight_1_4(allDisplayHeight)
    },
    _calcHeight_1_4(allDisplayHeight){
      return this._calcHeight_one(allDisplayHeight, 4);
    },

    _calcHeight_small(allDisplayHeight){
      return this._calcHeight_1_3(allDisplayHeight)
    },
    _calcHeight_1_3(allDisplayHeight){
      return this._calcHeight_one(allDisplayHeight, 3);
    },

    _calcHeight_default(allDisplayHeight){
      return this._calcHeight_1_2(allDisplayHeight)
    },
    _calcHeight_1_2(allDisplayHeight){
      return this._calcHeight_one(allDisplayHeight, 2);
    },

    _calcHeight_big(allDisplayHeight){
      return this._calcHeight_2_3(allDisplayHeight)
    },
    _calcHeight_2_3(allDisplayHeight){
      return (allDisplayHeight - this.space * 3) / 3 * 2 + this.space
    },

    _calcHeight_one(allDisplayHeight, total){
        return (allDisplayHeight - this.space * (total + 1)) / total
    },

    _resize(){
      if(this.$children.length > 0){
        this.updateLayout();
      }else{
        // this.$el.style.width = 0
      }
    },
  },

  mounted(){
    // const onResize = debounce(()=>{
    //   this._resize();
    // });
    // window.addEventListener('resize', onResize)
    // this.$once('hook:beforeDestroy', ()=>{
    //   window.removeEventListener('resize', onResize)
    // });
    this.updateLayout();
  },

  // beforeDestroy(){
  // },
}
</script>

<style>
  .panes-container{
    /*background: #678543;
    z-index: 1100;*/
  }
  .panes-container > :last-child{
    margin-bottom: 45px;
  }
@media screen and (max-width: 1920px)  {
  .panes-container > :last-child{
    margin-bottom: 10px;
  }
}
  .cow-box-left{
    float: left;
  }
  .cow-box-right{
    float: right;
  }
</style>
