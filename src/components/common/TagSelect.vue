<template>
  <span class="tag-select">
    <el-tag v-for="option in options"
      :key="option.value"
      @click="onTagClick(option)"
      :type="option.type"
      :size="size"
      :effect="option.effect"
      class="tag-select-tag"
      :class="getStateClass(option)">{{option.label}}</el-tag>
  </span>
</template>

<script>

export default {
  props: {
    disabled: {
      type: Boolean,
    },
    readonly: {
      type: Boolean,
    },
    selectEffect: {
      type: String,
      default: 'dark'
    },
    defaultEffect: {
      type: String,
      default: 'plain'
    },
    size: {
      type: String,
      default: 'small'
    },
    type: {
      type: String,
      default: ''
    },
    // status:{
    //   type: Boolean ,
    //   default: false,
    // },
    items: {
      type: Array,
      default(){
        return []
      }
    },
    value:{},
    muti: {
      type: Boolean,
    },
    unCheck: {//单选时，可否取消选中
      type: Boolean,
      default: true,
    }
  },
  data () {
    return {
      modelValue: this.value,
      options: this.items2Options(),
    }
  },
  computed:{
    model: {
      get() {
        return this.modelValue
      },

      set(val) {
        this.$emit('input', val);
        this.modelValue = val;
      }
    },
  },
  methods: {
    onTagClick(option){
      if(this.disabled || this.readonly || option.disabled)return;
      let checked = false
      if(this.selectEffect == option.effect){
        if(!this.muti && !this.unCheck)return
        option.effect = this.defaultEffect
      }else{
        option.effect = this.selectEffect
        checked = true
      }
      let value
      if(this.muti){
        value = this.model
        if(!value){
          value = []
        }
        if(checked){
          value.push(option.value)
        }else{
          const i = value.indexOf(option.value)
          if(i > -1){
            value.splice(i, 1)
          }
        }
      }else{
        if(option.value === this.model){
          value = null
        }else{
          var lastOption = this.findByValue(this.model)
          if(lastOption){
            lastOption.effect = this.defaultEffect
          }
          value = option.value
        }
      }
      this.options = this.options.slice(0)
      this.model = value
      this.$emit('change', value)
    },

    findByValue(val){
      const options = this.options
      for(var i=0,len=options.length; i<len; i++){
        var option = options[i]
        if(option.value == val){
          return option
        }
      }
    },

    getStateClass(option){
      return {
        'tag-select-tag-disabled':option.disabled
      }
    },

    items2Options(){
      return this.items.map(item=>{
        const type = typeof item
        let option
        if(type == 'string' || type == 'number'){
          option = {
            value: item,
            label: item,
            item,
          }
        }else{
          option = {
            value: item.value || item.label,
            label: item.label || item.value,
            item,
          }
        }
        if(this.muti){
          option.effect = ((this.value || []).indexOf(option.value) > -1 ? this.selectEffect : this.defaultEffect)
        }else{
          option.effect = (option.value == this.value ? this.selectEffect : this.defaultEffect)
        }
        option.type = item.type || this.type
        option.disabled = item.disabled || this.disabled
        return option
      });
    },

  },

  watch:{
     items(){
       this.options = this.items2Options()
     },
     value(){
       this.modelValue = this.value
       this.options = this.items2Options()
     },
  },
}
</script>

<style scoped>
  .tag-select .tag-select-tag + .tag-select-tag {
    margin-left: 10px;
  }
  .tag-select .tag-select-tag{
    cursor: pointer;
  }
  .tag-select .tag-select-tag-disabled{
    cursor: default;
    opacity: 0.5;
  }
</style>
