# spa-modal
react/vue 弹框组件 支持返回键关闭弹框 多层弹框并存
## vue-modal

```

vue.use(Modal);

let modal = this.$openModal({
    customClass: 'car-model-list-modal',
    maskClosable: true,
    position: 'right',
    content: <CarModelList on-setSelectedModel={this.setSelectedModel} selectedModel={this.selectedModel} carModelList={this.carModelList} />
});
modal.$on('maskClick', () => {
    DC.click('TM13');
});
```
openModal方法返回modal组件实例,因此可以使用组件的任何方法

关闭弹框分为两种情况：

1.关闭弹框并停留在当前页面
```
this.$emit('closeModal',event);
```
2.关闭弹框会跳转到新页面
```
this.$emit('closeModal');
this.$router.replace('新页面')
```