#### 1.Vue源码中的目录结构

```css
vue

├── benchmarks
├── dist  			vue打包后生成的目录
│   └── vue.js
│   └── vue.min.js
├── examples 		vue中一些使用的例子
├── flow 			因为Vue使用了Flow来进行静态类型检查，这里定义了声明了一些静态类型
├── packages		vue生成其他平台使用的npm包
│   ├── vue-server-renderer
│   ├── vue-template-compiler
│   ├── weex-template-compiler
│   ├── weex-vue-framework
├── scripts			脚本文件
│   └── bulid.js    npm run bulid 执行的文件
│   └── config.js   打包时候根据不同命令打包需要的配置
├── src
│   ├── compiler
│   │   ├── style.css
│   │   └── style1.css
│   ├── core
│   ├── platforms
│   ├── server
│   ├── sfc
│   │   └── parser.js	 包含了单文件 Vue 组件 (*.vue) 的解析逻辑。在 vue-template-compiler 包中被使用。
│   └── shared
│   │   ├── constans.js   vue中定义的常量
│   │   └── util.js		  vue中一些公用的方法
├── test			单元测试的目录
├── types 			typescript一些配置
├── package-lock.json
├── package.json
├── README.md

```

#### 2.从入口分析

从 [github](https://github.com/vuejs/vue.git) 中下载vue2的源码，`npm install` 安装依赖，查看`package.json` 中`scripts` 发现，我们在执行`那npm run dev` 时候对应的命令。

```JavaScript
"dev": "rollup -w -c scripts/config.js --environment TARGET:web-full-dev"
```

我们发现打包用的`rollup` 打包工具，类似于`webpack` 的一种打包工具，有兴趣可以研究 [rollupjs](http://rollupjs.org/guide/en/) ，大概的意思是执行配置文件是`scripts/config.js` 使用的环境变量是`web-full-dev`，那我们就找到这个文件，

```javascript
const builds = {
   ...
  // Runtime+compiler development build (Browser)
  'web-full-dev': {
    entry: resolve('web/entry-runtime-with-compiler.js'), // 打包的入口文件
    dest: resolve('dist/vue.js'), 						  // 打包生成的文件
    format: 'umd', 										  // 打包的格式 umd cmd
    env: 'development',									  // 打包的环境配置 开发还是生产	
    alias: { he: './entity-decoder' },						
    banner
  },
  ...
}
    
function genConfig(name) { // 根据name生成rollup的配置文件
    ...
}
    
if (process.env.TARGET) {
  // npm run dev  process.env.TARGET = web-full-dev
  module.exports = genConfig(process.env.TARGET)
} else {
  exports.getBuild = genConfig
  exports.getAllBuilds = () => Object.keys(builds).map(genConfig)
}    
    
```

从这个文件中我们可以看到执行`npm run dev` 会调用`genConfig(process.env.TARGET)`生成rollup打包的配置文件，根据入口文件我们可以找到`web/entry-runtime-with-compiler.js`这个文件，在统计目录下有个`alias.js` 文件，其实我们找的文件是`src/platforms/web/entry-runtime-with-compiler.js`

```javascript
const path = require('path')

const resolve = p => path.resolve(__dirname, '../', p)

module.exports = {
  vue: resolve('src/platforms/web/entry-runtime-with-compiler'),
  compiler: resolve('src/compiler'),
  core: resolve('src/core'),
  shared: resolve('src/shared'),
  web: resolve('src/platforms/web'), // web 对应的目录是 src/platforms/web
  weex: resolve('src/platforms/weex'),
  server: resolve('src/server'),
  sfc: resolve('src/sfc')
}
```

接下来我门来看下这个文件，我们发现了一些有用的信息

```javascript
	import Vue from './runtime/index' // 这个就是Vue的路径
	import { compileToFunctions } from './compiler/index' // 这个是模板编译时的路径
	...
    Vue.prototype.$mount = function ( //Vue原型上拓展$mount方法 
      el?: string | Element,
      hydrating?: boolean
    ): Component {
        ...
    }
       
     Vue.compile = compileToFunctions // Vue实例上添加compile属性
        
```

然后我们找到`./runtime/index` 文件，在这个文件中我们看到`Vue` 是从`core/index` 从别名中，我们看到真实的目录是`src/core/index`

```javascript
import Vue from 'core/index'
```

我们再来看看这个文件

```javascript
import Vue from './instance/index'
import { initGlobalAPI } from './global-api/index'
import { isServerRendering } from 'core/util/env'
import { FunctionalRenderContext } from 'core/vdom/create-functional-component'

initGlobalAPI(Vue)

// $isServer判断是否是服务段渲染
Object.defineProperty(Vue.prototype, '$isServer', {
  get: isServerRendering
})

// $ssrContext服务端渲染的内容
Object.defineProperty(Vue.prototype, '$ssrContext', {
  get () {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext
  }
})

// expose FunctionalRenderContext for ssr runtime helper installation
// FunctionalRenderContext 函数渲染的内容
Object.defineProperty(Vue, 'FunctionalRenderContext', {
  value: FunctionalRenderContext
})

// Vue版本信息
Vue.version = '__VERSION__'

export default Vue
```

然后我们看下`initClobalAPI`这个方法

```javascript
/* @flow */

import config from '../config'
import { initUse } from './use'
import { initMixin } from './mixin'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { set, del } from '../observer/index'
import { ASSET_TYPES } from 'shared/constants'
import builtInComponents from '../components/index'
import { observe } from 'core/observer/index'

import {
  warn,
  extend,
  nextTick,
  mergeOptions,
  defineReactive
} from '../util/index'

export function initGlobalAPI (Vue: GlobalAPI) {
  // config
  const configDef = {}
  configDef.get = () => config
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  // 拓展config属性
  Object.defineProperty(Vue, 'config', configDef)

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }

  // 拓展属性
  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  // 2.6 explicit observable API
  Vue.observable = <T>(obj: T): T => {
    observe(obj)
    return obj
  }

  Vue.options = Object.create(null)
  //ASSET_TYPES其实就是Vue的静态变量
  /**
  export const ASSET_TYPES = [
      'component',
      'directive',
      'filter'
    ]
  */
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue

  extend(Vue.options.components, builtInComponents)

  // Vue.use 
  initUse(Vue)
  // Vue.mixin 
  initMixin(Vue)
  // Vue.extend
  initExtend(Vue)
  // Vue.components Vue.directives Vue.filters
  initAssetRegisters(Vue)
}

```

然后找到`./instance/index`文件

```javascript
...

function Vue (options) { // 在这里我们终于找到了这个方法
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options) // 在initMixin中定义
}
...
export default Vue
```

我们来理下找到的目录顺序：

```
/src/platforms/web/entry-runtime-with-compiler.js   
--> /src/platforms/web/runtime/index.js    
--> /src/core/index.js    
--> /src/core/instance/index.js
```

`Vue`代码整体上可以分为两个平台，一个是我们常用的`web`，另一个是`weex`。所以源码里把两个平台不同的内容单独提取出来了。这里我们只谈`web`。

首先，在`Vue.config`上添加了几个平台相关的方法，扩展了`Vue.options.directives`（`model`和`show`）和`Vue.options.components`（`Transition`和`TransitionGroup`)。在`Vue.prototype`上添加了`__patch__`(虚拟dom相关)和`$mount`（挂载元素）。

最后是`/src/entries/web-runtime-with-compiler.js`，该文件主要干了两件事，一个是定义了一个方法`Vue.prototype.$mount`，另一个是将`compileToFunctions`挂在到`Vue.compile`上。


#### 3.分析`new Vue（）`

```javascript
import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function Vue (options) {
  // 判断使用的环境是production并且this是不是Vue的实例，不是给个警告
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // 在initMixin中定义
  this._init(options) 
}

initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue
```

从这个文件中我们可以看出很简单是吧，外部调用`new Vue()` 的时候，其实就是调用了一下`_init(options)`方法，其实这块应该又疑问，这个方法是在哪定义的，怎么绑定到`Vue`实例上去的。并且走了一下这几个方法：

```javascript
// _init
initMixin(Vue)  
// $set、$delete、$watch
stateMixin(Vue)
// $on、$once、$off、$emit
eventsMixin(Vue)
// _update、$forceUpdate、$destroy
lifecycleMixin(Vue)
// $nextTick、_render、以及多个内部调用的方法
renderMixin(Vue)
```

下面我们就来分析，`initMixin()`方法

```javascript
export function initMixin (Vue: Class<Component>) {
  // 往Vue原型上拓展一个_init方法
  Vue.prototype._init = function (options?: Object) {
    // this别名  var that = this
    const vm: Component = this
    // a uid
    vm._uid = uid++
	
     /* 先不用关注这块 start */
    let startTag, endTag
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // a flag to avoid this being observed
    // 设置监听数据变化的
    vm._isVue = true
    // merge options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options)
    } else {
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
    /* 先不用关注这块 end */
      
      
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    // 初始化生命关系，定义$parent $children $root ..
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate')
    initInjections(vm) // resolve injections before data/props
    initState(vm)
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }

    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}
```

在这个文件中，我们先来学习几个方法`mergeOptions`  `resolveConstructorOptions`

##### `mergeOptions`

`mergeOptions`是`Vue`中处理属性的合并策略的地方。在`util/options.js`这个文件中我们可以看到到`Vue`中合并`生命周期钩子、components、directives、filters、mixins、watch`等

```javascript
/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 */
export function mergeOptions (
  parent: Object,
  child: Object,
  vm?: Component
): Object {
  if (process.env.NODE_ENV !== 'production') {
    // options.components中校验组件名称是否合法
    // `^[a-zA-Z][\\-\\.0-9_${unicodeRegExp.source}]*$`
    checkComponents(child)
  }

  if (typeof child === 'function') {
    child = child.options
  }

  // 格式化props属性
  normalizeProps(child, vm)
  // 格式化Inject属性
  normalizeInject(child, vm)
  // 格式化Directives属性   
  normalizeDirectives(child)

  // Apply extends and mixins on the child options,
  // but only if it is a raw options object that isn't
  // the result of another mergeOptions call.
  // Only merged options has the _base property.
  if (!child._base) {
    if (child.extends) {
      parent = mergeOptions(parent, child.extends, vm)
    }
    if (child.mixins) {
      for (let i = 0, l = child.mixins.length; i < l; i++) {
        parent = mergeOptions(parent, child.mixins[i], vm)
      }
    }
  }

  const options = {}
  let key
  for (key in parent) {
    mergeField(key)
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }
  function mergeField (key) {
    // 疑问：starts是从什么地方来的
    /*
      const strats = config.optionMergeStrategies
      config.js中定义
      optionMergeStrategies: { [key: string]: Function };
    */
     // 所以strats就是一个对象{key：function}
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
}
```

```javascript
/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */
function mergeAssets (
  parentVal: ?Object,
  childVal: ?Object,
  vm?: Component,
  key: string
): Object {
  const res = Object.create(parentVal || null)
  if (childVal) {
    process.env.NODE_ENV !== 'production' && assertObjectType(key, childVal, vm)
    return extend(res, childVal)
  } else {
    return res
  }
}

ASSET_TYPES.forEach(function (type) {
  strats[type + 's'] = mergeAssets
})
```

`_assetTypes`就是`components`、`directives`、`filters`，这三个的合并策略都一样，这里我们都返回了`parentVal`的一个子对象。

`data`属性的合并策略

```javascript
/**
 * Helper that recursively merges two data objects together.
 */
function mergeData (to: Object, from: ?Object): Object {
  if (!from) return to
  let key, toVal, fromVal

  const keys = hasSymbol
    ? Reflect.ownKeys(from)
    : Object.keys(from)

  for (let i = 0; i < keys.length; i++) {
    key = keys[i]
    // in case the object is already observed...
    // 如果存在__ob__属性，说明该属性已经被观察了
    if (key === '__ob__') continue
    toVal = to[key]
    fromVal = from[key]
    if (!hasOwn(to, key)) {
      set(to, key, fromVal)
    } else if (
      toVal !== fromVal &&
      isPlainObject(toVal) &&
      isPlainObject(fromVal)
    ) {
      mergeData(toVal, fromVal)
    }
  }
  return to
}

/**
 * Data
 */
export function mergeDataOrFn (
  parentVal: any,
  childVal: any,
  vm?: Component
): ?Function {
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal
    }
    if (!parentVal) {
      return childVal
    }
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    return function mergedDataFn () {
      return mergeData(
        typeof childVal === 'function' ? childVal.call(this, this) : childVal,
        typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal
      )
    }
  } else {
    return function mergedInstanceDataFn () {
      // instance merge
      // 我们知道Vue中data选项要么是对象，要么是function，并且访问时候通常都是this.xxx
      // 所以判断是方法就执行改变this指向问题
      const instanceData = typeof childVal === 'function'
        ? childVal.call(vm, vm)
        : childVal
      const defaultData = typeof parentVal === 'function'
        ? parentVal.call(vm, vm)
        : parentVal
      if (instanceData) {
        return mergeData(instanceData, defaultData)
      } else {
        return defaultData
      }
    }
  }
}

// 合并data中的数据
strats.data = function (
  parentVal: any,
  childVal: any,
  vm?: Component
): ?Function {
  if (!vm) { // 不存在vm实例
    if (childVal && typeof childVal !== 'function') {
      process.env.NODE_ENV !== 'production' && warn(
        'The "data" option should be a function ' +
        'that returns a per-instance value in component ' +
        'definitions.',
        vm
      )

      return parentVal
    }
    return mergeDataOrFn(parentVal, childVal)
  }

  return mergeDataOrFn(parentVal, childVal, vm)
}
```

合并后的options，在控制台中打印`vm.$options`,可以看到`data: function mergedInstanceDataFn()`

![1609746751492](C:\Users\l\AppData\Roaming\Typora\typora-user-images\1609746751492.png)

##### `resolveConstructorOptions`

```javascript
// 从调用中可以看到Ctor其实就是vm.constructor 就是Vue对象
export function resolveConstructorOptions (Ctor: Class<Component>) {
  let options = Ctor.options
  // 有super属性，说明Ctor是通过Vue.extend()方法创建的子类
  if (Ctor.super) { // super属性是在调用extend方法时候添加的
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}
```

这里打印了下`options`

![1609741123676](C:\Users\l\AppData\Roaming\Typora\typora-user-images\1609741123676.png)

#####  `initLifecycle(vm)`

```javascript
export function initLifecycle (vm: Component) {
  const options = vm.$options

  // locate first non-abstract parent
  let parent = options.parent
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent
    }
    parent.$children.push(vm)
  }

  vm.$parent = parent
  vm.$root = parent ? parent.$root : vm

  vm.$children = []
  vm.$refs = {}

  vm._watcher = null
  vm._inactive = null
  vm._directInactive = false
  vm._isMounted = false
  vm._isDestroyed = false
  vm._isBeingDestroyed = false
}
```

该方法比较简单，主要就是给`vm`对象添加了`$parent`、`$root`、`$children`属性，以及一些其它的生命周期相关的标识。

`options.abstract`用于判断是否是抽象组件，组件的父子关系建立会跳过抽象组件，抽象组件比如`keep-alive`、`transition`等。所有的子组件`$root`都指向顶级组件。

##### `initEvents(vm)`

```javascript
export function initEvents (vm: Component) {
  vm._events = Object.create(null)
  vm._hasHookEvent = false
  // init parent attached events
  const listeners = vm.$options._parentListeners
  if (listeners) {
    updateComponentListeners(vm, listeners)
  }
}
```

该方法初始化事件相关的属性，`_parentListeners`是父组件中绑定在自定义标签上的事件，供子组件处理。

##### `initRender(vm)`

```javascript
export function initRender (vm: Component) {
  vm._vnode = null // the root of the child tree
  vm._staticTrees = null // v-once cached trees
  const options = vm.$options
  const parentVnode = vm.$vnode = options._parentVnode // the placeholder node in parent tree
  const renderContext = parentVnode && parentVnode.context
  vm.$slots = resolveSlots(options._renderChildren, renderContext)
  vm.$scopedSlots = emptyObject
  // bind the createElement fn to this instance
  // so that we get proper render context inside it.
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // internal version is used by render functions compiled from templates
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
  // normalization is always applied for the public version, used in
  // user-written render functions.
  // createElement其实就是我们常说的render函数
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)

  // $attrs & $listeners are exposed for easier HOC creation.
  // they need to be reactive so that HOCs using them are always updated
  const parentData = parentVnode && parentVnode.data

  /* istanbul ignore else */
  if (process.env.NODE_ENV !== 'production') {
    defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, () => {
      !isUpdatingChildComponent && warn(`$attrs is readonly.`, vm)
    }, true)
    defineReactive(vm, '$listeners', options._parentListeners || emptyObject, () => {
      !isUpdatingChildComponent && warn(`$listeners is readonly.`, vm)
    }, true)
  } else {
    defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, null, true)
    defineReactive(vm, '$listeners', options._parentListeners || emptyObject, null, true)
  }
}
```

这里给`vm`添加了一些虚拟dom、`slot`等相关的属性和方法。

然后会调用`beforeCreate`钩子函数。

##### `initInjections(vm)` 和 `initProvide(vm)`

```JavaScript
export function initProvide (vm: Component) {
  const provide = vm.$options.provide
  if (provide) {
    vm._provided = typeof provide === 'function'
      ? provide.call(vm)
      : provide
  }
}

export function initInjections (vm: Component) {
  const result = resolveInject(vm.$options.inject, vm)
  if (result) {
    toggleObserving(false)
    Object.keys(result).forEach(key => {
      /* istanbul ignore else */
      if (process.env.NODE_ENV !== 'production') {
        defineReactive(vm, key, result[key], () => {
          warn(
            `Avoid mutating an injected value directly since the changes will be ` +
            `overwritten whenever the provided component re-renders. ` +
            `injection being mutated: "${key}"`,
            vm
          )
        })
      } else {
        defineReactive(vm, key, result[key])
      }
    })
    toggleObserving(true)
  }
}
```

这两个配套使用，用于将父组件`_provided`中定义的值，通过`inject`注入到子组件，且这些属性不会被观察。看下面这个例子：

```JavaScript
<div id="app">
	<p>{{message}}</p>
	<child></child>
</div>
<script type="text/javascript">
	var vm = new Vue({
		el: '#app',
		data: {
			message: '第一个vue实例'
		},
		components: {
			child: {
				template: "<div>{{a}}</div>",
				inject: ['a']
			}
		},
		provide: {
			a: 'a'
		}
	})
</script>
```

##### `initState(vm)`

```JavaScript
export function initState (vm: Component) {
  vm._watchers = []
  const opts = vm.$options
  // 有props，初始化props
  if (opts.props) initProps(vm, opts.props)
  // 有methods，初始化methods  
  if (opts.methods) initMethods(vm, opts.methods)
  // 有data初始化data，没有就自定义一个空对象
  if (opts.data) {
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  // 有computed，初始化computed
  if (opts.computed) initComputed(vm, opts.computed)
  // 初始化watch
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}
```

此时我们看下vm对象变成什么了？![1609748740842](C:\Users\l\AppData\Roaming\Typora\typora-user-images\1609748740842.png)

然后，就会调用我们的`created`钩子函数。

我们看到`create`阶段，基本就是对传入数据的格式化、数据的双向绑定、以及一些属性的初始化。此时，我们就可以获取到数据的值

##### `$mount(vm.$options.el)`

```JavaScript
const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})

const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && query(el)

  /* istanbul ignore if */
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  // options.render 是否存在存在直接是之前的vm._c方法生成html
  if (!options.render) {
    let template = options.template
    // 判断是否有tempate
    if (template) {
      // 判断是否是字符串
      if (typeof template === 'string') {
        // 判断是否是id选择器
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) { // 判断template是不是dom元素 nodeType 元素是1 文本是3
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {// 模板字符串，获取el的outerHTML
      template = getOuterHTML(el)
    }
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }
	
      // 通过compileToFunctions函数对template进行解析。生成render staticRenderFns
      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  return mount.call(this, el, hydrating)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el: Element): string {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

```

首先，通过`mount = Vue.prototype.$mount`保存之前定义的`$mount`方法，然后重写。

这里的`query`可以理解为`document.querySelector`，只不过内部判断了一下`el`是不是字符串，不是的话就直接返回，所以我们的`el`也可以直接传入dom元素。

之后判断是否有`render`函数，如果有就不做处理直接执行`mount.call(this, el, hydrating)`。如果没有`render`函数，则获取`template`，`template`可以是`#id`、模板字符串、dom元素，如果没有`template`，则获取`el`以及其子内容作为模板。

##### `compileToFunctions`

```javascript
import { createCompilerCreator } from './create-compiler'

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  // 调用parse解析成ast模板                                                  
  const ast = parse(template.trim(), options)
  if (options.optimize !== false) {
    optimize(ast, options)
  }
  const code = generate(ast, options)
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})

// createCompilerCreator
import { createCompileToFunctionFn } from './to-function'
export function createCompilerCreator (baseCompile: Function): Function {
  return function createCompiler (baseOptions: CompilerOptions) {
      // 解析的核心方法
     function compile (
      template: string,
      options?: CompilerOptions
    ): CompiledResult {
      // 创建一个对象__proto__ 是baseOptions
      const finalOptions = Object.create(baseOptions)
      const errors = []
      const tips = []
	
      // 定义警告方法
      let warn = (msg, range, tip) => {
        (tip ? tips : errors).push(msg)
      }

      if (options) {
        if (process.env.NODE_ENV !== 'production' && options.outputSourceRange) {
          // $flow-disable-line
          const leadingSpaceLength = template.match(/^\s*/)[0].length
		 // 重写警告方法
          warn = (msg, range, tip) => {
            const data: WarningMessage = { msg }
            if (range) {
              if (range.start != null) {
                data.start = range.start + leadingSpaceLength
              }
              if (range.end != null) {
                data.end = range.end + leadingSpaceLength
              }
            }
            (tip ? tips : errors).push(data)
          }
        }
        // merge custom modules
        if (options.modules) {
          finalOptions.modules =
            (baseOptions.modules || []).concat(options.modules)
        }
        // merge custom directives
        if (options.directives) {
          finalOptions.directives = extend(
            Object.create(baseOptions.directives || null),
            options.directives
          )
        }
        // copy other options
        for (const key in options) {
          if (key !== 'modules' && key !== 'directives') {
            finalOptions[key] = options[key]
          }
        }
      }
	  // 拓展属性，将options中属性代理到finalOptions
      finalOptions.warn = warn
		
      // 这个baseCompile又是参数传递进来的 
      const compiled = baseCompile(template.trim(), finalOptions)
      if (process.env.NODE_ENV !== 'production') {
        detectErrors(compiled.ast, warn)
      }
      compiled.errors = errors
      compiled.tips = tips
      return compiled
    }
      
    return {
      compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    }
  }
}

// createCompileToFunctionFn
export function createCompileToFunctionFn (compile: Function): Function {
  const cache = Object.create(null)

  return function compileToFunctions (
    template: string,
    options?: CompilerOptions,
    vm?: Component
  ): CompiledFunctionResult {
    options = extend({}, options)
    const warn = options.warn || baseWarn
    delete options.warn
    ...
    // compile 入参
    const compiled = compile(template, options)
	...
    // turn code into functions
    const res = {}
    const fnGenErrors = []
    res.render = createFunction(compiled.render, fnGenErrors)
    res.staticRenderFns = compiled.staticRenderFns.map(code => {
      return createFunction(code, fnGenErrors)
    })

    return (cache[key] = res)
  }
}
```

我们来理下解析的大概过程

```javascript
$mount --》 compileToFunctions --》 compile --》 baseCompile --》 parse --》 optimize --》generate
```

执行完`parse`之后得到的`ast`![1609831771386](C:\Users\l\AppData\Roaming\Typora\typora-user-images\1609831771386.png)

再调用`optimize` 之后得到的 `ast`,这一步只是对 `ast` 进行优化，分析出静态不变的内容部分，增加了部分属性:![1609831927905](C:\Users\l\AppData\Roaming\Typora\typora-user-images\1609831927905.png)最

最后调用`generate`得到`render`函数![1609832099621](C:\Users\l\AppData\Roaming\Typora\typora-user-images\1609832099621.png)

我们得到最终的render如下：

```javascript
render: function () {
	with(this){return _c('div',{attrs:{"id":"app"}},[_v("\n      "+_s(msg)+"\n    ")])}"
}
```

在`src/core/instance/render-helpers/index.js`中，我们曾经添加过如下多个函数，这里和`render`内返回值调用一一对应。

```javascript
Vue.prototype._o = markOnce
Vue.prototype._n = toNumber
Vue.prototype._s = toString
Vue.prototype._l = renderList
Vue.prototype._t = renderSlot
Vue.prototype._q = looseEqual
Vue.prototype._i = looseIndexOf
Vue.prototype._m = renderStatic
Vue.prototype._f = resolveFilter
Vue.prototype._k = checkKeyCodes
Vue.prototype._b = bindObjectProps
Vue.prototype._v = createTextVNode
Vue.prototype._e = createEmptyVNode
Vue.prototype._u = resolveScopedSlots
Vue.prototype._g = bindObjectListeners
Vue.prototype._d = bindDynamicKeys
Vue.prototype._p = prependModifier
```

##### `mountComponent`

```javascript
export function mountComponent (
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  vm.$el = el
  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode
    if (process.env.NODE_ENV !== 'production') {
      ...
    }
  }
  // 调用生命周期钩子：beforeMount
  callHook(vm, 'beforeMount')

  // 创建一个Watcher
  new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* isRenderWatcher */)
  hydrating = false

  if (vm.$vnode == null) {
    vm._isMounted = true
    // 调用生命周期钩子：mounted
    callHook(vm, 'mounted')
  }
  return vm
}
```

我们来看下`Watcher`这个类中的代码

```javascript
export default class Watcher {
  // 类中的私有属性
  vm: Component;
  expression: string;
  cb: Function;
  id: number;
  deep: boolean;
  user: boolean;
  lazy: boolean;
  sync: boolean;
  dirty: boolean;
  active: boolean;
  deps: Array<Dep>;
  newDeps: Array<Dep>;
  depIds: SimpleSet;
  newDepIds: SimpleSet;
  before: ?Function;
  getter: Function;
  value: any;

  constructor (
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: ?Object,
    isRenderWatcher?: boolean
  ) {
    this.vm = vm
    if (isRenderWatcher) {
      vm._watcher = this
    }
    vm._watchers.push(this)
    ...
    // parse expression for getter
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      this.getter = parsePath(expOrFn)
      ...
    }
    this.value = this.lazy
      ? undefined
      : this.get()
  }

  /**
   * Evaluate the getter, and re-collect dependencies.
   */
  get () {
    pushTarget(this)
    let value
    const vm = this.vm
    try {
      value = this.getter.call(vm, vm)
    } catch (e) {
      if (this.user) {
        handleError(e, vm, `getter for watcher "${this.expression}"`)
      } else {
        throw e
      }
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value)
      }
      popTarget()
      this.cleanupDeps()
    }
    return value
  }
```

在这个类中，构造函数中`expOrFn`其实就是`updateComponent` 然后赋值给`this.getter`, 在获取`this.value` 的时候会调用 `this.get()`,在`get`中就调用`this.getter`,所以`updateComponent`方法会被调用。

调用`updateComponent` 方法的时候，就是执行了`vm._update(vm._render(), hydrating)`

##### `vm._render()`

这个其实就是之前调用的`render`函数，也就是`vm._c`

##### `vm._update`

```javascript
  Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
    const vm: Component = this
    const prevEl = vm.$el
    const prevVnode = vm._vnode
    const restoreActiveInstance = setActiveInstance(vm)
    vm._vnode = vnode
    // Vue.prototype.__patch__ is injected in entry points
    // based on the rendering backend used.
    if (!prevVnode) {
      // initial render
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
    } else {
      // updates
      vm.$el = vm.__patch__(prevVnode, vnode)
    }
    restoreActiveInstance()
    // update __vue__ reference
    if (prevEl) {
      prevEl.__vue__ = null
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm
    }
    // if parent is an HOC, update its $el as well
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el
    }
    // updated hook is called by the scheduler to ensure that children are
    // updated in a parent's updated hook.
  }
```

从`mountComponent`中我们知道创建`Watcher`对象先于`vm._isMounted = true`。所以这里的`vm._isMounted`还是`false`，不会调用`beforeUpdate`钩子函数。

下面会调用`vm.__patch__`，在这一步之前，页面的dom还没有真正渲染。该方法包括真实dom的创建、虚拟dom的diff修改、dom的销毁等，具体细节且等下面分析。