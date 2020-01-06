<template>
  <div class="facility-button" :class="checkedClass">
    <input type="hidden" :value="inputValue">
    <div class="facility-button-label-row">
      <label class="facility-button-label">{{label}}</label>
    </div>
    <div class="facility-button-img-row" @click="onClick">
      <img class="facility-button-img" :src="icon"/>
    </div>
  </div>
</template>

<script>


export default {
  name: 'facility-button',
  model:{
    prop: 'value',
    event: 'change'
  },
  props: {
    onValue: {
      default: 'on'
    },
    offValue: {
      default: 'off'
    },
    value: {
      default: 'off'
    },
    label: {
      type: [String, Number],
      default: ''
    },
    icon: {
      default: '/static/images/person.png'
    }
  },
  data(){
    return {
      check: this.value == this.onValue,
    }
  },
  computed: {
    checkedClass(){
      return {
        'facility-button-check': this.check
      }
    },
    inputValue(){
      return this.check ? this.onValue : this.offValue
    }
  },
  methods: {
    onClick(e){
      const check = !this.check;
      // this.check = check;//?
      this.$emit('change', check);
      this.$emit('click', check);
      this.$emit('update:value', check)
    }
  },

  watch: {
    value(value){
      this.check = (value == this.onValue)
    }
  }
}
</script>
<style scoped>
.facility-button{
  display: inline-flex;
  flex-direction: column;
}
.facility-button-label-row{
  background: #331111;
  color: #FFF;
  padding: 2px 5px;
}
.facility-button-check .facility-button-label-row{
  background: #339999;
}
.facility-button-img-row{
  width: 50px;
  height: 50px;
  border-radius: 25px;
  cursor: pointer;
}
</style>
