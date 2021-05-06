## web面试

### css

 - 居中

   > 行内元素和块级元素

   ```
    行内元素：
    	text-align: center;
    	
    	line-height: 200px;
    	height: 200px;
    
    块级元素：
    	position：absolute;
    	top: 50%;
    	height: 50%;
    	transform: translate(-50%, -50%);
    	
    	
    	position：absolute;
    	top: 0;
    	left: 0;
    	right: 0;
    	bottom: 0;
    	
    	
    	display: flex;
    	align-item: center;
    	justify-content: center;
   ```

 - 盒模型

   ```
   盒子模型分为标准盒模型和怪异盒模型
   
   box-sizing: content-box（标准）
   box-sizing: border-box（怪异）
   ```

   **标准盒模型：**

   ![img](https://pic4.zhimg.com/80/v2-0ccf14bce917a263bbf734a35f06c8d3_720w.jpg)

   **怪异盒模型：**

   ![img](https://pic2.zhimg.com/80/v2-b4961242f8b1cd27e9d9da2d0f268a4d_720w.jpg)

 - 三角形

	> 原理是利用border完成的，`width: 0;height: 0`, 边框分开写:
	>
	```css
	#triangle {
	width: 0;
		height: 0;
		border-top: 50px solid transparent;
		border-left: 100px solid red;
		border-bottom: 50px solid transparent;
	}
	```
	
 - 清除浮动

   - 父级添加`overflow: hidden`
   - 在浮动元素后添加一个块级元素，`clear: both`
   - 给父级元素添加伪类`:after` `:before`，并添加`clear: both`

- BFC
  - 内部的块元素会在垂直方向，一个接一个地放置。
  - 块元素垂直方向的距离由margin决定。两个相邻块元素的垂直方向的margin会发生重叠。
  - 每个元素的左外边距，与包含块的左边相接触(对于从左往右的格式化，否则相反)。即使存在浮动也是如此。
  - BFC的区域不会与float元素的区域重叠。
  - BFC就是页面上的一个隔离的独立容器，容器里面的子元素不会影响到外面的元素。反之也如此。
  - 计算BFC的高度时，浮动元素也参与计算

### js

- 深浅拷贝

  当把A赋值给B时，当A发生变化的时候，如果B也跟着变化，那就是浅拷贝，如果B不发生变化，那就是深拷贝

  数组中`slice`和`concat`方法时浅拷贝，引用类型直接`=`

  `JSON.parse(JSON.stringify(obj))` 深拷贝

- typeof 和 instanceof

  typeof 是一个一元运算符，放在运算数之前，返回值是：**number、string、boolean、object、function 和 undefined。**  数组和对象返回都是`object`

  instanceof **用来测试一个对象在其原型链中是否存在一个构造函数的 prototype 属性**

- 原型和原型链

  - **每个对象都有 __proto__ 属性，但只有函数对象才有 prototype 属性**
  - **实例的构造函数属性（constructor）指向构造函数** 
  - **原型对象（Person.prototype）是 构造函数（Person）的一个实例**

- 数据类型

```
基本数据类型： Number, String, Boolean, null, undefined, symbol
引用数据类型：function, Object, Date, Array, Reg
```

- 数组去重

```
for循环遍历 
	空数组 indexOf 
	空对象  利用键值唯一性去重
es6 new Set(arr)   Array.form() 或者 [...*] 将数据变成数组
```

- Object.create()

![1618120411793](D:\Program Files\Typora\1618120411793.png)

用`Object.create()`创建的对象：

- 创建非空对象的属性是不可写，不可枚举的

- 当用构造函数或对象字面量方法创建空对象时，对象时有原型属性的，即有`_proto_`;
  当用Object.create()方法创建空对象时，对象是没有原型属性的。

![1618120722220](C:\Users\l\AppData\Roaming\Typora\typora-user-images\1618120722220.png)

- 创建的对象，属性是挂载在原型下边的，可以直接访问，但是是通过**原型链**来访问到属性值

![1618121505532](C:\Users\l\AppData\Roaming\Typora\typora-user-images\1618121505532.png)


### vue

- v-for 和 v-if 优先级

```
v-for优先级高于v-if
源码中生成ast时候就是先判断v-for，然后才判断v-if
还有就是写过测试代码，看生成的render函数的结构，都能发现，v-for 的优先级高于 v-if

分为两种情况：
1. 同级的时候，生成render是在列表渲染函数中判断v-if，影响性能，解决方案，利用计算属性先做过滤，使v-for中的数据都是要渲染的
2. 不同级，看v-if的条件是单独还是和要循环数据相关的，外部不用说，就是
<template v-if="condition">
	<div v-for="item in items"></div>
</template>
如果是相关的，也可以利用计算属性先做层代理实现
```

- data是一个函数，而不直接是一个对象

```
函数返回的是一个新的对象
因为组件可能需要在多个地方使用，如果是一个对象，会造成数据污染，但如果是一个function，在数据初始化的时候，会调用该方法，返回值作为一个新的data对象，这样就避免的数据污染，根实例没有这个限制是因为一般只有一个实例，不会出现多实例的情况，在源码中也可以找到，根组件和组件在数据合并的时候是不一样方法
```

- key的作用和工作原理

```
1.主要作用是为了高效的更新虚拟DOM，原理是vue在pathch的时候会通过key能准确判断两个节点是否是同一个，避免频繁的更新不同元素，pathchVnode 中updateChildren中减少DOM操作
2.在列表渲染的时候，可能会出现未知错误
```

- $nextTick

```
1.是Vue提供的全局的api，由于Vue的异步更新策略导致我们对数据修改不会立刻体现到DOM变化，如果想要立即获取更新后dom状态，就需要使用这个方法
2.vue在更新DOM是异步执行的，只要侦听器监听到数据的变化，Vue就会开启一个队列，并缓冲在同一事件循环中发生的所有数据变更，同一个watcher触发多次，只会有一次加到队列中，nextTick方法会在队列中加入一个回调函数，确保该函数在前面dom操作完成后才调用
3.传入一个回调，在回调中可以拿到更新后的dom
```

- 父子组件生命周期

```
1. 渲染时候
父组件： beforeCreate -> 父组件 created -> 父组件beforeMounte -> 子组件: beforeCreate -> 子组件 created -> 子组件： beforeMounte -> 子组件： mounted -> 父组件：mounted

2. 子组件更新
父组件： beforeUpdate -> 子组件： beforeUpdate -> 子组件： updated -> 父组件： updated

3.父组件更新
父组件： beforeUpdate ->  父组件： updated

4. 销毁时候
父组件： beforeDestroy -> 子组件： beforeDestroy -> 子组件： destroyed -> 父组件： destroyed
```

- Vue中组件通信方式

```
1. props
2.$emit/$on
3.$attrs/$listeners
4.$children/$parent
5.ref
6.vuex
7. $root
8. provide/ inject

父子组件之间的通信：1 2 3 4 5
兄弟组件之间的通信：  4 6 7
跨级组件之间的通信： 6 7 8
```

