import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import * as t from '@babel/types'
import { generate } from '@babel/generator'
import { readFileSync, writeFileSync } from 'fs'

// Load locale data
const zhLocales = JSON.parse(readFileSync('src/client/locales/zh.json', 'utf-8'))
const zhToKey = {}
for (const [key, value] of Object.entries(zhLocales)) {
  zhToKey[value] = key
}

const content = readFileSync('src/client/index.tsx', 'utf-8')
const ast = parse(content, {
  sourceType: 'module',
  plugins: ['jsx', 'typescript'],
})

let replacementCount = 0

// Helper: create t('key') call expression
function createTCall(key) {
  return t.callExpression(
    t.identifier('t'),
    [t.stringLiteral(key)]
  )
}

// Helper: create JSX expression container with t('key')
function createJSXCall(key) {
  return t.jsxExpressionContainer(createTCall(key))
}

// Check if a node is inside a JSX context (needs JSXExpressionContainer)
function isInJSXContext(path) {
  let node = path.node
  let parentPath = path.parentPath
  
  while (parentPath) {
    const parent = parentPath.node
    
    if (t.isJSXAttribute(parent) && parent.value === node) {
      return true
    }
    if (t.isJSXElement(parent) || t.isJSXFragment(parent)) {
      return true
    }
    if (t.isJSXExpressionContainer(parent)) {
      return true
    }
    if (t.isObjectProperty(parent) && parent.value === node) {
      return false
    }
    if (t.isArrayExpression(parent) && parent.elements.includes(node)) {
      return false
    }
    if (t.isVariableDeclarator(parent) && parent.init === node) {
      return false
    }
    if (t.isReturnStatement(parent) && parent.argument === node) {
      return false
    }
    if (t.isConditionalExpression(parent) && (parent.consequent === node || parent.alternate === node)) {
      return false
    }
    if (t.isLogicalExpression(parent) && (parent.left === node || parent.right === node)) {
      return false
    }
    if (t.isBinaryExpression(parent) && (parent.left === node || parent.right === node)) {
      return false
    }
    
    node = parent
    parentPath = parentPath.parentPath
  }
  
  return true
}

// Traverse the AST and replace string literals
traverse(ast, {
  StringLiteral(path) {
    const text = path.node.value
    const hasChinese = /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(text)
    if (!hasChinese || text.length < 2) return
    
    if (text in zhToKey) {
      replacementCount++
      const inJSX = isInJSXContext(path)
      const replacement = inJSX ? createJSXCall(zhToKey[text]) : createTCall(zhToKey[text])
      path.replaceWith(replacement)
    }
  },
  
  JSXText(path) {
    const text = path.node.value
    const hasChinese = /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(text)
    if (!hasChinese || text.length < 2) return
    
    if (text in zhToKey) {
      replacementCount++
      path.replaceWith(createJSXCall(zhToKey[text]))
    }
  },
})

// Generate output code
const output = generate(ast, {}, content)

writeFileSync('src/client/index.tsx', output.code, 'utf-8')

console.log(`Replacements: ${replacementCount}`)

// Count remaining Chinese
const remaining = (output.code.match(/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]{2,}/g) || []).length
console.log(`Remaining Chinese: ${remaining}`)

// Show sample t() calls
const tCalls = output.code.match(/t\('([^']+)'\)/g) || []
console.log(`t() calls: ${tCalls.length}`)
console.log('\nSample t() calls:')
const unique = [...new Set(tCalls)].slice(0, 10)
for (const tc of unique) {
  console.log(`  ${tc}`)
}
