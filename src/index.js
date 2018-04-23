import Vue from 'vue'
import Modal from './index.vue'
export default {
    install(Vue, options) {
        Vue.prototype.$openModal = function(options = {}) {
            let { $router: router, $store: store } = this
            let modal = new Vue({
                router,
                store,
                render: h => h(
                    Modal, {
                        props: options
                    }
                )
            })
            document.body.appendChild(modal.$mount().$el)
            return modal.$children[0]
        }
    }
}