#!/usr/bin/env node
/*
 * Simple build script for chrome-extension directory
 * Copies files to .output/extension, then optionally zips the extension
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import archiver from 'archiver'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const projectRoot = path.resolve(__dirname, '..')
const extensionSrc = path.join(projectRoot, 'chrome-extension')
const outDir = path.join(projectRoot, '.output', 'extension')

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src)
  const stats = exists && fs.statSync(src)
  const isDirectory = exists && stats.isDirectory()
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName))
    })
  } else {
    // file copy
    fs.copyFileSync(src, dest)
  }
}

// Clean out old build
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true })
}

fs.mkdirSync(outDir, { recursive: true })

copyRecursiveSync(extensionSrc, outDir)

// Copy Nuxt-generated popup HTML if exists
const nuxtPopupHtml = path.join(projectRoot, '.output', 'popup', 'popup', 'index.html')
const extPopupHtml = path.join(outDir, 'popup', 'popup.html')
if (fs.existsSync(nuxtPopupHtml)) {
  fs.mkdirSync(path.dirname(extPopupHtml), { recursive: true })
  fs.copyFileSync(nuxtPopupHtml, extPopupHtml)
  console.warn('Copied Nuxt popup HTML to extension:', extPopupHtml)
} else {
  console.warn('Nuxt popup HTML not found:', nuxtPopupHtml)
}

// Create zip
const zipPath = path.join(projectRoot, '.output', 'extension.zip')
if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath)

const output = fs.createWriteStream(zipPath)
const archive = archiver('zip', { zlib: { level: 9 } })

output.on('close', () => {
  console.warn(`ZIP created: ${zipPath} (${archive.pointer()} total bytes)`)
})
archive.on('warning', err => {
  if (err.code === 'ENOENT') console.warn(err)
  else throw err
})
archive.on('error', err => {
  throw err
})
archive.pipe(output)
archive.directory(outDir, false)
archive.finalize()
