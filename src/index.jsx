import React, { Component, PropTypes } from 'react';
import ReactDom from 'react-dom';
import './index.scss';

class ModalComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            animateClass: this.getAnimateClass(props.position)
        };
    }

    componentDidMount() {
        this.addEventHandler();
    }

    componentWillUnmount() {
        this.removeEventHandler();
    }

    getAnimateClass = (position) => {
        switch (position) {
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
    }

    addEventHandler = () => {
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
    }
    removeEventHandler = () => {
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
    }

    closeModal = (e) => {
        const { state: { animateClass }, props: { wrapper } } = this;

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
        this.setState({
            animateClass: `${animateClass}-reverse`,
        }, () => {
            setTimeout(() => {
                ReactDom.unmountComponentAtNode(wrapper);
                document.body.removeChild(wrapper);
            }, 300);
        });
    }
    closeBtnClick = (e) => {
        if (this.props.closeBtnClick) {
            this.props.closeBtnClick(e)
        } else {
            this.closeModal(e);
        }
    }
    maskClick = (e) => {
        if (this.props.maskClosable) {
            if (this.props.maskClick) {
                this.props.maskClick();
            }
            this.closeModal(e);
        }
    }

    render() {
        const { state: { animateClass }, props: { customClass, customStyle, content, showCloseBtn, position, closeBtnClick, maskClick } } = this
        let wrapperClass = `modal ${customClass}`;
        let modalClass = `modal-${position} ${animateClass}`;

        content.props.closeModal = closeModal;
        return (
            <div className={wrapperClass}>
                <svg style="position: absolute; width: 0; height: 0;" version="1.1" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <symbol id="icon-close" viewBox="0 0 32 32">
                            <title>close</title>
                            <path d="M17.387 16l8.907-8.907c0.373-0.373 0.373-1.013 0-1.44-0.373-0.373-1.013-0.373-1.387 0l-8.907 8.907-8.907-8.853c-0.373-0.373-1.013-0.373-1.44 0-0.373 0.373-0.373 1.013 0 1.387l8.907 8.907-8.907 8.907c-0.373 0.373-0.373 1.013 0 1.44 0.373 0.373 1.013 0.373 1.387 0l8.907-8.907 8.907 8.907c0.373 0.373 1.013 0.373 1.387 0 0 0 0 0 0 0 0.373-0.373 0.373-1.013 0-1.44l-8.853-8.907z"></path>
                        </symbol>
                    </defs>
                </svg>
                <div className={modalClass} onClick={maskClick}>
                    <div className="modal-container" style={customStyle} onClick={e => e.stopPropagation()}>
                        {content}
                        {showCloseBtn && (
                            <svg className="modal-close-btn" onClick={closeBtnClick}>
                                <use xlinkHref="#icon-close" />
                            </svg>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

ModalComponent.propTypes = {
    customClass: PropTypes.string,
    customStyle: PropTypes.object,
    showCloseBtn: PropTypes.bool,
    maskClosable: PropTypes.bool,
    position: PropTypes.oneOf(['center', 'top', 'right', 'bottom', 'left'])
};

ModalComponent.defaultProps = {
    customClass: '',
    customStyle: {},
    showCloseBtn: false,
    maskClosable: false,
    position: 'center'
}

export default {
    openModal: (options = {}) => {
        let wrapper = document.createElement('div');
        wrapper.className = 'modal-root';
        document.body.appendChild(wrapper);

        ReactDom.render(
            <ModalComponent {...options} wrapper={wrapper} />,
            wrapper
        );
    }
};