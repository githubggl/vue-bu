export default function getExceptions({name, main}={}){
  return [
    {
      path: '403',
      name: name ? '403': '',
      component: () => import('@/views/exception/Exception_403.vue'),
    },
    {
      path: '*',
      name: name ? '404': '',
      meta: {
        main: !!main
      },
      component: () => import('@/views/exception/Exception_404.vue'),
    }
  ]
}
