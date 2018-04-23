<script>
/**@argument
 * <template>
    <div class="hmc-modal-root">
        <div :class="wrapperClass">
            <div class="modal">
                <div :class="modalClass" @click="maskClosable && closeModal">
                    <div class="modal-container" :style="customStyle" @click.stop>
                        <component :is="content"></component>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
 */
/**@argument
 * 关闭弹框分为两种情况：
 * 1、关闭弹框并停留在当前页面：this.$emit('closeModal',event);
 * 2、关闭弹框会跳转到新页面：this.$emit('closeModal');this.$router.replace('新页面')
 */
export default {
    name: 'ModalComponent',
    props: {
        customClass: {
            default: ''
        },
        customStyle: {
            default: null
        },
        content: {
            default: {}
        },
        maskClosable: {
            default: false
        },
        showCloseBtn: {
            default: false
        },
        position: {
            default: 'center'
        }
    },
    data() {
        return {
            animateClass: this.getAnimateClass()
        };
    },
    mounted() {
        this.addEventHandler();
        this.$emit('modalMounted');
    },
    beforeDestroy() {
        this.removeEventHandler();
        this.$emit('modalBeforeDestroy');
    },
    methods: {
        getAnimateClass() {
            switch (this.position) {
                case 'top':
                    return 'slide-down';
                case 'right':
                    return 'slide-left';
                case 'bottom':
                    return 'slide-up';
                case 'left':
                    return 'slide-right';
                default:
                    return 'fade-in';
            }
        },
        addEventHandler() {
            if (!window.modalList || window.modalList.length == 0) {
                window.modalList = [];
                history.pushState(null, null, location.href);
            } else {
                window.removeEventListener('popstate', window.modalList.slice(-1)[0].closeModal, false);
            }
            window.addEventListener('popstate', this.closeModal, false);
            window.modalList.push(this);
            if (window.modalList.length > 1) {
                return;
            }
            let overflowContainer = document.querySelector('.overflow-container');
            if (overflowContainer) {
                overflowContainer.style.overflowY = 'hidden';
                overflowContainer.style.webkitOverflowScrolling = 'auto';
            }
        },
        removeEventHandler() {
            window.removeEventListener('popstate', this.closeModal, false);
            // fix IOS 点击遮罩区后再关闭弹框，页面按钮点击没反应
            document.body.scrollIntoView();
            if (window.modalList.length > 0) {
                return;
            }
            let overflowContainer = document.querySelector('.overflow-container');
            if (overflowContainer) {
                overflowContainer.style.overflowY = 'auto';
                overflowContainer.style.webkitOverflowScrolling = 'touch';
            }
        },
        closeModal(e) {
            var vm = this;
            const { animateClass, $el } = vm;

            if (e && e.type == 'click') {
                if (window.modalList.length == 1) {
                    history.back();
                    return;
                } else {
                    e.stopPropagation();
                }
            }

            window.modalList.pop();
            if (window.modalList.length) {
                if (e && e.type == 'popstate') {
                    history.pushState(null, null, location.href);
                }
                window.addEventListener('popstate', window.modalList.slice(-1)[0].closeModal, false);
            }

            vm.animateClass = `${animateClass}-reverse`;
            vm.$nextTick().then(() => {
                setTimeout(() => {
                    vm.$destroy();
                    document.body.removeChild($el);
                }, 300);
            });
        },
        closeBtnClick(e) {
            if (this.$listeners.closeBtnClick || this._events.closeBtnClick) {
                this.$emit('closeBtnClick', e);
            } else {
                DC.click('MB2U');
                this.closeModal(e);
            }
        },
        maskClick(e) {
            if (this.maskClosable) {
                this.$emit('maskClick');
                this.closeModal(e);
            }
        }
    },
    computed: {
        wrapperClass() {
            const { customClass } = this;
            return `modal ${customClass}`;
        },
        modalClass() {
            const { animateClass, position } = this;
            return `modal-${position} ${animateClass}`;
        }
    },
    render() {
        const { wrapperClass, customStyle, content, maskClosable, showCloseBtn, modalClass, closeModal, closeBtnClick, maskClick } = this;
        let { listeners = {} } = content.componentOptions;
        listeners.closeModal = closeModal;
        content.componentOptions.listeners = listeners;
        return (
            <div class="hmc-modal-root">
                <svg style="position: absolute; width: 0; height: 0;" version="1.1" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <symbol id="icon-close" viewBox="0 0 32 32">
                            <title>close</title>
                            <path d="M17.387 16l8.907-8.907c0.373-0.373 0.373-1.013 0-1.44-0.373-0.373-1.013-0.373-1.387 0l-8.907 8.907-8.907-8.853c-0.373-0.373-1.013-0.373-1.44 0-0.373 0.373-0.373 1.013 0 1.387l8.907 8.907-8.907 8.907c-0.373 0.373-0.373 1.013 0 1.44 0.373 0.373 1.013 0.373 1.387 0l8.907-8.907 8.907 8.907c0.373 0.373 1.013 0.373 1.387 0 0 0 0 0 0 0 0.373-0.373 0.373-1.013 0-1.44l-8.853-8.907z"></path>
                        </symbol>
                    </defs>
                </svg>
                <div class={wrapperClass}>
                    <div class={modalClass} onClick={maskClick}>
                        <div class="modal-container" style={customStyle} onClick={e => e.stopPropagation()}>
                            {content}
                            {showCloseBtn && (
                                <svg class="modal-close-btn" onClick={closeBtnClick}>
                                    <use xlinkHref="#icon-close" />
                                </svg>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};
</script>
<style lang="scss">
$mask-bg: rgba(0, 0, 0, 0.5);
$box-shadow: 0 0 60px rgba(0, 0, 0, 0.4);
$modal-z: 99;
$modal-container-z: 100;
$animation-duration: 0.3s !default;
$font-size: 12px;
$word-black:#1e1e1e;//字体黑
.absolute-position {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
}

.modal {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: $mask-bg;
    z-index: $modal-z;
    font-size: $font-size;
    .modal-container {
        position: relative;
        .modal-close-btn {
            position: absolute;
            z-index: 9;
            top: 15px;
            right: 15px;
            width: 30px;
            height: 30px;
            fill: $word-black;
        }
    }
    &-center,
    &-top,
    &-right,
    &-bottom,
    &-left {
        @extend .absolute-position;
        z-index: $modal-container-z;
        display: flex;
    }
    &-center {
        justify-content: center;
        align-items: center;
        overflow-y: auto;
        .modal-container {
            min-width: 70%;
            max-height: 90%;
            border-radius: 4px;
        }
    }
    &-top {
        .modal-container {
            width: 100%;
        }
    }
    &-right {
        justify-content: flex-end;
        align-items: flex-start;
        .modal-container {
            height: 100%;
        }
    }
    &-left {
        .modal-container {
            height: 100%;
        }
    }
    &-bottom {
        align-items: flex-end;
        .modal-container {
            width: 100%;
        }
    }
    &-container {
        box-shadow: $box-shadow;
        background: #fff;
    }
}

// animations, to optimize later
.fade-in {
    animation: $animation-duration ease-in fadeIn forwards;
}

.fade-in-reverse {
    animation: $animation-duration ease-out fadeInReverse forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes fadeInReverse {
    from {
        opacity: 1;
    }
    to {
        opacity: 0;
    }
}

.slide-right {
    transform: translateX(-100%);
    animation: $animation-duration ease-in 0.3s slideRight forwards;
}

.slide-right-reverse {
    animation: $animation-duration ease-out slideRightReverse forwards;
}

@keyframes slideRight {
    from {
        transform: translateX(-100%);
    }
    to {
        transform: translateX(0);
    }
}

@keyframes slideRightReverse {
    from {
        transform: translateX(0);
    }
    to {
        transform: translateX(-100%);
    }
}

.slide-left {
    transform: translateX(100%);
    animation: $animation-duration ease-in 0.3s slideLeft forwards;
}

.slide-left-reverse {
    animation: $animation-duration ease-out slideLeftReverse forwards;
}

@keyframes slideLeft {
    from {
        transform: translateX(100%);
    }
    to {
        transform: translateX(0);
    }
}

@keyframes slideLeftReverse {
    from {
        transform: translateX(0);
    }
    to {
        transform: translateX(100%);
    }
}

.slide-down {
    transform: translateY(-100%);
    animation: $animation-duration ease-in 0.3s slideDown forwards;
}

.slide-down-reverse {
    animation: $animation-duration ease-out slideDownReverse forwards;
}

@keyframes slideDown {
    from {
        transform: translateY(-100%);
    }
    to {
        transform: translateY(0);
    }
}

@keyframes slideDownReverse {
    from {
        transform: translateY(0);
    }
    to {
        transform: translateY(-100%);
    }
}

.slide-up {
    transform: translateY(100%);
    animation: $animation-duration ease-in 0.3s slideUp forwards;
}

.slide-up-reverse {
    animation: $animation-duration ease-out slideUpReverse forwards;
}

@keyframes slideUp {
    from {
        transform: translateY(100%);
    }
    to {
        transform: translateY(0);
    }
}

@keyframes slideUpReverse {
    from {
        transform: translateY(0);
    }
    to {
        transform: translateY(100%);
    }
}
</style>