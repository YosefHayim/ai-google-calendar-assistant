const { parse } = require('@babel/parser')
const MagicString = require('magic-string')
const path = require('path')
const fs = require('fs')

const VALID_EXTENSIONS = new Set(['.jsx', '.tsx'])

module.exports = function componentTaggerLoader(code) {
  const callback = this.async()

  const transform = async () => {
    try {
      const resourcePath = this.resourcePath

      if (!resourcePath || typeof code !== 'string' || code.length === 0) {
        return null
      }

      const ext = path.extname(resourcePath)
      if (!ext || !VALID_EXTENSIONS.has(ext)) {
        return null
      }

      if (resourcePath.includes('node_modules')) {
        return null
      }

      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
        sourceFilename: this.resourcePath,
      })

      const ms = new MagicString(code)
      const fileRelative = path.relative(this.rootContext, this.resourcePath)
      let transformCount = 0

      // Simple AST walker
      const walk = (node, callback) => {
        if (!node || typeof node !== 'object') return
        callback(node)
        for (const key in node) {
          const child = node[key]
          if (Array.isArray(child)) {
            child.forEach((c) => walk(c, callback))
          } else if (child && typeof child === 'object' && child.type) {
            walk(child, callback)
          }
        }
      }

      walk(ast, (node) => {
        try {
          if (node.type !== 'JSXOpeningElement') return
          if (node.name?.type !== 'JSXIdentifier') return

          const tagName = node.name.name
          if (!tagName) return

          // Skip if already tagged
          const alreadyTagged = node.attributes?.some(
            (attr) => attr.type === 'JSXAttribute' && attr.name?.name === 'data-component-path',
          )
          if (alreadyTagged) return

          const loc = node.loc?.start
          if (!loc) return

          const componentPath = `${fileRelative}:${loc.line}:${loc.column}`

          if (node.name.end != null) {
            ms.appendLeft(node.name.end, ` data-component-path="${componentPath}" data-component-name="${tagName}"`)
            transformCount++
          }
        } catch (error) {
          console.warn(`[component-tagger] Warning: Failed to process JSX node in ${this.resourcePath}:`, error)
        }
      })

      if (transformCount === 0) {
        return null
      }

      const transformedCode = ms.toString()
      return {
        code: transformedCode,
        map: ms.generateMap({ hires: true }),
      }
    } catch (error) {
      console.warn(`[component-tagger] Warning: Failed to transform ${this.resourcePath}:`, error)
      return null
    }
  }

  transform()
    .then((result) => {
      if (result) {
        callback(null, result.code, result.map)
      } else {
        callback(null, code)
      }
    })
    .catch((err) => {
      console.error(`[component-tagger] ERROR in ${this.resourcePath}:`, err)
      callback(null, code)
    })
}
