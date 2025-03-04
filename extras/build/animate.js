const packageName = 'animate.css'

// ------------

const glob = require('glob')
const { copySync } = require('fs-extra')
const { writeFileSync } = require('fs')
const { join, resolve, basename } = require('path')

const dist = resolve(__dirname, '../animate')

const pkgFolder = resolve(__dirname, `../node_modules/${ packageName }/`)
const cssFiles = glob.sync(pkgFolder + '/source/*/*.css')
const cssNames = new Set()

const inAnimations = []
const outAnimations = []
const generalAnimations = []

function extract (file) {
  const name = basename(file).match(/(.*)\.css/)[ 1 ]

  if (cssNames.has(name)) {
    return
  }

  copySync(file, join(dist, name + '.css'))
  cssNames.add(name)

  if (name.indexOf('In') > -1) {
    inAnimations.push(name)
  }
  else if (name.indexOf('Out') > -1) {
    outAnimations.push(name)
  }
  else {
    generalAnimations.push(name)
  }
}

function getList (prefix) {
  return `
${ prefix }generalAnimations = ${ JSON.stringify(generalAnimations, null, 2) }

${ prefix }inAnimations = ${ JSON.stringify(inAnimations, null, 2) }

${ prefix }outAnimations = ${ JSON.stringify(outAnimations, null, 2) }
`.replace(/"/g, '\'')
}

if (cssFiles.length === 0) {
  console.log('WARNING. Animate.css skipped completely')
}
else {
  cssFiles.forEach(file => {
    extract(file)
  })

  generalAnimations.sort()
  inAnimations.sort()
  outAnimations.sort()

  copySync(join(pkgFolder, 'LICENSE'), join(dist, 'LICENSE'))

  const common = getList('module.exports.')

  writeFileSync(join(dist, 'animate-list.js'), common, 'utf-8')
  writeFileSync(join(dist, 'animate-list.mjs'), getList('export const '), 'utf-8')
  writeFileSync(join(dist, 'animate-list.common.js'), common, 'utf-8')

  writeFileSync(join(dist, 'animate-list.d.ts'), getList('export type ').replace(/\[/g, '').replace(/\]/g, ';').replace(/\ {2}'/g, '  | \'').replace(/,/g, ''), 'utf-8')
  writeFileSync(join(dist, 'animate-list.common.d.ts'), getList('export type ').replace(/\[/g, '').replace(/\]/g, ';').replace(/\ {2}'/g, '  | \'').replace(/,/g, ''), 'utf-8')
}
