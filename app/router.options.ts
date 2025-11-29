export default {
  scrollBehavior(to: any, from: any, savedPosition: any) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
}
