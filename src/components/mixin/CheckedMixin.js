export default {
  props:{
    value: Boolean,
    disabled: Boolean,
    readonly: Boolean,
    readOnly: Boolean,
  },
  data(){
    return {
      modelValue: this.value,
    }
  },
  computed: {
    model: {
      get() {
        return  this.modelValue
      },
      set(val) {
        this.$emit('input', val);
        this.modelValue = val;
      }
    },
    isReadOnly(){
      return this.readonly || this.readOnly
    },
  },
  methods: {
    handleClick(e){
      if(this.disabled || this.isReadOnly)return;
      const value = !this.model
      this.model = value
      this.$emit('change', value, e);
    },
    handleChange(ev) {
      console.log('handleChange>',ev);
      let value = ev.target.checked;
      this.modelValue = value;
      this.$emit('change', value, ev);
    }
  },
  watch:{
    value(value){
      this.modelValue = value
    }
  }
}
