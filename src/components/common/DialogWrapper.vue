<template>
  <el-dialog
    v-bind="dialogBinds"
    :visible="dialogVisible"
    v-on="$listeners">
    <component v-bind:is="component" ref="c" @onAction="onAction" v-bind="binds" @change="onChange"/>
    <span slot="footer" class="dialog-footer">
      <el-button @click="close">{{cancelLabel}}</el-button>
      <el-button :disabled="positiveDisabled" type="primary" @click="onPositiveClick">{{okLabel}}</el-button>
    </span>
  </el-dialog>
</template>

<script>

import DialogMixin from '../mixin/DialogMixin'

export default {
  mixins: [DialogMixin],
  props: {
    component: Object,
    binds: Object,
    cancelLabel: {
      type: String,
      default: "取 消"
    },
    okLabel: {
      type: String,
      default: '确 定'
    }
  },
}
</script>
