<template>
  <el-dialog
    v-bind="dialogBinds"
    :visible="dialogVisible"
    v-on="dialogListeners">
    <keep-alive>
      <component ref="c" v-bind:is="currentComponent" @onAction="onAction" v-bind="binds"/>
    </keep-alive>
    <span slot="footer" class="dialog-footer">
      <el-button v-show="showPreBtn" type="primary" @click="onBackClick">上一步</el-button>
      <el-button @click="close">取 消</el-button>
      <el-button v-show="showPositiveBtn" :disabled="positiveDisabled" type="primary" @click="onPositiveClick">确 定</el-button>
      <el-button v-show="showNextBtn" :disabled="nextDisabled" type="primary" @click="onNextClick">下一步</el-button>
    </span>
  </el-dialog>
</template>

<script>

import DialogMixin from '@/components/mixin/DialogMixin'
import StepMixin from '@/components/mixin/StepMixin'

export default {
  mixins: [StepMixin, DialogMixin],
  props: {
    stepComponents: {
      type: Array,
      required: true
    },
    binds: Object,
    nextDisabled: Boolean,
  },

  computed: {
    dialogBinds(){
      const {stepComponents,binds,visible, ...dialogBinds} = this.$attrs || {}
      if(!dialogBinds.width){
        dialogBinds.width = '600px'
      }
      if(dialogBinds.customClass){
        dialogBinds.customClass += 'StepDialog'
      }else{
        dialogBinds.customClass = 'StepDialog'
      }
      if(dialogBinds.closeOnClickModal !== true){
        dialogBinds.closeOnClickModal = false
      }
      return dialogBinds
    },
    dialogListeners(){
      const {open, close, onAction, ...dialogListeners} = this.$listeners
      dialogListeners.open = e=>{
        if(open){
          open.call(this, e)
        }
        this.stepReset()
      };
      dialogListeners.close = e=>{
        if(close){
          close.call(this, e)
        }
        this.onClose()
      };
      return dialogListeners
    },
  },

  methods: {
    onAction(payload){
      this.$emit('onAction', payload)
    },
    async invoke(name){
      const ci = this.$refs.c
      if(ci[name]){
        try{
          await ci[name]()
        }catch(e){
          console.error(e);
        }
        return true
      }
      return false
    },
    // onAction(e){
    //   const {action, payload} = e
    //   if(this[action]){
    //     this[action](payload)
    //   }else{
    //     console.log('unknown action: '+action, e);
    //   }
    // },
    onOpen(){
      this.stepReset()
    },

    onClose(){
      this.$emit('onAction', {action: 'onDialogClose', payload: this})
    },

    onBackClick(){
      this.stepBack()
      this.$emit("onAction", {action: 'onDialogBackClick', payload: this})
      this.invoke('doBack')
    },

    onNextClick(){
      this.stepNext()
      this.$emit("onAction", {action: 'onDialogNextClick', payload: this})
      this.invoke('doNext')
    },
  },

}
</script>

<style>
  .StepDialog .el-dialog__body{
    padding: 0;
  }
</style>
