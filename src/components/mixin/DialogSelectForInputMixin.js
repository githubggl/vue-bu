export default {
  inheritAttrs: false,
  model: {
    prop: 'value',
    event: 'change'
  },

  props: {
    value: Object,
    valueProp: {
      type: String,
      default: 'name'
    },
  },

  data(){
    return {
      dialogVisible: false,

      entity: this.value,
      reset: null,
    }
  },

  computed: {
    displayValue(){//inputValue
      const value = this.value
      return value && value[this.valueProp] || ''
    },
    inputAttrs(){
      const {value, ...inputAttrs} = this.$attrs || {}
      return inputAttrs
    },
    inputListeners(){
      const {focus, ...inputListeners} = this.$listeners || {}
      inputListeners.focus = e=>{
        if(focus){
          focus.call(this, e)
        }
        this.onInputFocus(e)
      }
      return inputListeners
    },

    selectBinds(){
      return {
        value: this.entity,
        reset: this.reset,
      }
    },
  },

  methods: {
    onAction(e){
      const {action, payload} = e
      if(this[action]){
        this[action](payload)
      }
    },

    onSelectChange(value){
      this.entity = value
    },
    doPositiveClick(){
      this.dialogVisible = false
      this.$emit('change', this.entity)
    },
    onInputFocus(e){
      this.dialogVisible = true
    },
    onDialogOpen(){
      this.reset = {}
      this.entity = this.value
    },
  },

  // watch: {
  //   value(value){
  //     this.entity = value
  //   },
  // }
}
