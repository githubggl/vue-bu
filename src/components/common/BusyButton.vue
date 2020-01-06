<template>
    <el-button v-bind="$attrs" v-on="listeners" :disabled="disabledValue"><slot></slot></el-button>
</template>

<script>

export default {
    name: 'busy-button',
    inheritAttrs: false,

    props: {
        timeout: {
            type: Number,
            default: 1000,
        },
        disabled: Boolean,
    },

    data(){
        return {
            disabledValue: this.disabled,
        }
    },
    computed: {
        listeners(){
            var vm = this
            return Object.assign({}, this.$listeners, {
              click: function (event) {
                  vm.setDisabled(true)
                  vm.$emit('click', event)
                  vm.timer=setTimeout(function(){
                    vm.setDisabled(false)
                  }, vm.timeout)
              }
            })
        },
    },
    methods: {
      setDisabled(disabled){
        this.disabledValue = disabled
        this.$emit('update:disabled', disabled)
      },
    },
    watch:{
      disabled(disabled){
        this.disabledValue = disabled
      }
    }
}
</script>
