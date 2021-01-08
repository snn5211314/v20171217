class MVVM {
	constructor(options) {
		this.$data = typeof options.data === 'function' ? options.data() : options.data;
		this.$el = options.el;
		let computed = options.computed;
		
		if (this.$el) {
			// 数据劫持
			new Observer(this.$data)
			
			for (let key in computed) {
				Object.defineProperty(this.$data, key, {
					get: () => {
						return computed[key].call(this)
					}
				})
			}
			
			// 数据代理
			this.proxy(this.$data)
			// 模板编译
			new Compile(this.$el, this)
		}
	}
	
	proxy(data) {
		Object.keys(data).forEach(key => {
			Object.defineProperty(this, key, {
				get: () => {
					return this.$data[key]
				},
				set: (newValue) => {
					if (newValue !== this.$data[key]) {
						this.$data[key] = newValue
					}
				}
			})
		})
	}
}

class Observer {
	constructor(data) {
	    this.observer(data)
	}
	
	observer(data) {
		if(typeof data !== 'object') return
		Object.keys(data).forEach(key => {
			this.defineReactive(key, data[key], data)
		})
	}
	
	defineReactive(key, value, obj) {
		// 递归调用，数据劫持
		this.observer(value)
		let dep = new Dep()
		Object.defineProperty(obj, key, {
			get: () => {
				Dep.target && dep.addDep(Dep.target);
				return value;
			},
			set: (newVal) => {
				if (newVal !== value) {
					// 如果新值是一个对象也要监控
					this.observer(newVal);
					value = newVal;
					dep.notify();
				}
			}
		})
	}
}

// 工具函数
CompileUtil = {
	setValue(expr, vm, newValue) {
		expr.split('.').reduce((data, current, index, arr) => {
			if (index === arr.length - 1) {
				return data[current] = newValue;
			}
			return data[current]
		}, vm.$data);
	},
	getValue(expr, vm) {
		return expr.split('.').reduce((data, current) => {
			return data[current]
		}, vm.$data)
	},
	getContentValue(expr, vm) {
		return expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
			return this.getValue(args[1], vm)
		})
	},
	model(node, expr, vm) {
		let fn = this.updater['modelUpdater'];
		new Watcher(vm, expr, (newValue) => {
			fn(node, newValue)
		});
		// 视图改变数据
		node.addEventListener('input', (e) => {
			let value = e.target.value;
			this.setValue(expr, vm, value);
		});
		let value = this.getValue(expr, vm);
		fn(node, value);
	},
	html(node, expr, vm) {
		let fn = this.updater['htmlUpdater'];
		let value = this.getValue(expr, vm);
		fn(node, value);
	},
	text(node, expr, vm) {
		let fn = this.updater['textUpdater'];
		let content = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
			// 给每一个插值表达式，添加watcher
			new Watcher(vm, args[1], () => {
				fn(node, this.getContentValue(expr, vm));
			})
			return this.getValue(args[1], vm);
		})
		fn(node, content);
	},
	updater: {
		modelUpdater(node, value) {
			node.value = value;
		},
		htmlUpdater(node, value) {
			node.innerHTML = value;
		},
		textUpdater(node, value) {
			node.textContent = value
		}
	}
}
	
class Compile {
	constructor(el, vm) {
	    this.vm = vm
		// 判断el是不是一个dom元素
		this.$el = this.isElement(el) ? el : document.querySelector(el);
		
		// dom操作很消耗性能，所以将dom操作移到内存中
		let fragments = this.nodeToFragment(this.$el)
		
		// 模板编译，替换数据
		this.compile(fragments)
		
		// 将编译后的fragments添加到el上
		this.$el.appendChild(fragments)
	}
	
	compile(node) {
		// 获取node中所有的子节点，是个类数组
		let firstNodes = node.childNodes
		// 要得到所有的子节点需要循环，需要把类数组变成数组才能forEach
		Array.from(firstNodes).forEach((node) => {
			// 判断元素类型，需要对dom和文本分开处理
			if (this.isElement(node)) {
				this.compileElement(node)
				// 元素需要再次编译下子节点
				this.compile(node)
			} else {
				this.compileText(node)
			}
		})
	}
	
	// 编译元素
	compileElement(node) {
		// 获取node中所有的属性
		let attributes = node.attributes;
		Array.from(attributes).forEach((attr) => {
			let {name, value: expr} = attr
			if (this.isDirective(name)) {
				let [, directive] = name.split('-')
				CompileUtil[directive](node, expr, this.vm)
			}
		})
	}
	
	// 编译文本
	compileText(node) { // 静态文本， 注释文本
		let content = node.textContent;
		// 只需要找到{{}}这个中的文本
		if (/\{\{(.+?)\}\}/g.test(content)) {
			CompileUtil['text'](node, content, this.vm)
		}
	}
	
	// 将dom节点移动到内存中
	nodeToFragment(node) {
		let fragments = document.createDocumentFragment();
		let firstChild;
		while(firstChild = node.firstChild) {
			// appendChild具有移动操作，会把node的节点回移除
			fragments.appendChild(firstChild)
		}
		return fragments
	}
	
	// 判断是不是dom元素
	isElement(node) {
		return node.nodeType === 1;
	}
	// 判断是不是指令
	isDirective(type) {
		return type.startsWith('v-');
	}
}

class Dep {
	constructor() {
	    this.subs = []
	}
	
	// 订阅
	addDep(watcher) {
		this.subs.push(watcher)
	}
	
	// 发布
	notify() {
		this.subs.forEach(watcher => {
			return watcher.update()
		})
	}
}

class Watcher { // 观察者
	constructor(vm, expr, cb) {
		this.vm = vm;
		this.expr = expr;
		this.cb = cb;
		
		// 获取旧值
		this.oldValue = this.get()
	}
	
	get() {
		// 定义全局属性 target
		Dep.target = this;
		// 获取值的时候会调用 Observer defineReactive  get方法
		let value = CompileUtil.getValue(this.expr, this.vm);
		// 清除target指向， 只会触发对应的notify
		Dep.target = null;
		return value;
	}
	
	update() { // 更新操作，数据发生变化，会调用该方法
		let newVal = CompileUtil.getValue(this.expr, this.vm);
		if (newVal !== this.oldValue) {
			this.cb(newVal)
		}
	}
}