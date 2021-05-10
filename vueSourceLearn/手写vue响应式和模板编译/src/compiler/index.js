import { parse } from "./parser"

export function mount(el) {
  el = el && query(el)
  let template = getOuterHTML(el)
  compileToFunctions(template)
}

function query(el) { // el要不是选择器，要不是dom
  if (typeof el === 'string') {
    const selected = document.querySelector(el)
    return selected
  } else {
    return el
  }
}

function getOuterHTML(el) {
  return el.outerHTML
}

function compileToFunctions(template) {
  createCompiler(template)
}

export const createCompiler = function (template) {
  const ast = parse(template.trim())
  const code = generate(ast, options)
  return {
    ast,
    render: code.render
  }
}