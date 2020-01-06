export default {
  data(){
    return {
      step: 0,
      // stepComponents: [],
    }
  },

  computed: {
    currentComponent(){
      return this.stepComponents && this.stepComponents[this.step] || null
    },
    showPreBtn(){
      return this.step > 0
    },
    showNextBtn(){
      return this.step < (this.stepComponents.length - 1)
    },
    showPositiveBtn(){
      return this.step == (this.stepComponents.length - 1)
    },
  },

  methods: {
    // onAction(e){
    //   const {action, payload} = e
    //   if(this[action]){
    //     this[action](payload)
    //   }else{
    //     console.log('unknown action: '+action, e);
    //   }
    // },
    stepReset(){
      this.step = 0
    },

    stepBack(){
      this.step--;
    },

    stepNext(){
      this.step++
    },
  },
}
