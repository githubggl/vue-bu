export default {
  inheritAttrs: false,
  props: {
    visible: Boolean,
    disabled: false,
  },

  data(){
    return {
      dialogVisible: this.visible,
      positiveClicked: false,
    }
  },

  computed: {
    dialogBinds(){
      const props = this.$props
      const attrs = this.$attrs
      const binds = {}
      for(var attr in attrs){
        if(!props[attr]){
          binds[attr] = attrs[attr]
        }
      }
      return binds
    },
    positiveDisabled(){
      return this.positiveClicked || this.disabled
    },
    ci(){
      return this.$refs["c"]
    },
  },

  methods: {

    delay(name, time=0){
      if(!name) return
      if(typeof name != 'function'){
        name = this[name]
      }
      if(typeof name == 'function'){
        return setTimeout(()=>{
          name.call(this)
        }, time)
      }
    },

    async invoke(name){
      if(this.ci[name]){
        try{
          await this.ci[name]()
        }catch(e){
          console.error(e);
        }
        return true
      }
      return false
    },

    onAction(payload){
      this.close()
      this.$emit('onAction', payload)
    },

    onChange(e){
      this.$emit('onAction', {action: 'onSelectChange', payload: e})
    },

    async onPositiveClick(){
      this.positiveClicked = true
      if(!(await this.invoke('save'))){
        this.doPositiveClick()
      }
      this.delay(function(){
        this.positiveClicked = false
      }, 1000)
      // setTimeout(()=>this.positiveClicked = false, 1000)
    },

    doPositiveClick(){
      this.$emit('onAction', {action: 'doPositiveClick', payload: this})
    },

    close(){
      this.dialogVisible = false
      this.$emit('update:visible', false)
    },
  },

  watch: {
    visible(visible){
      this.dialogVisible = visible
    }
  },
}
