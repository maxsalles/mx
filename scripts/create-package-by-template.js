import chalk from 'chalk'
import ejs from 'ejs'
import fs from 'fs'
import inquirer from 'inquirer'
import path from 'path'
import url from 'url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const packagesDir = path.join(__dirname, '../packages')
const templatesDir = path.join(__dirname, '../templates')
const CHOICES = fs.readdirSync(templatesDir)

const QUESTIONS = [
  {
    name: 'template',
    type: 'list',
    message: 'What package template would you like to generate?',
    choices: CHOICES
  },
  {
    name: 'name',
    type: 'input',
    message: 'Package name:'
  }
]

const SKIP_FILES = ['node_modules', '.template.json']

function toCamelCase (str) {
  return [
    str
      .toLowerCase()
      .replace(/-(.)/g, (_, g) => g.toUpperCase())
  ].map(s => s.charAt(0).toUpperCase() + s.slice(1))[0]
}

function createProject (path) {
  if (fs.existsSync(path)) {
    console.log(chalk.red(`Folder ${path} already exists. Delete or use another name.`))

    return false
  }

  fs.mkdirSync(path)

  return true
}

function createDirectoryContents (templatePath, packageName, variables) {
  // read all files/folders (1 level) from template folder
  const filesToCreate = fs.readdirSync(templatePath)

  // loop each file/folder
  filesToCreate.forEach(file => {
    const origFilePath = path.join(templatePath, file)

    // get stats about the current file
    const stats = fs.statSync(origFilePath)

    // skip files that should not be copied
    if (SKIP_FILES.indexOf(file) > -1) return

    if (stats.isFile()) {
      // read file content and transform it using template engine
      let contents = fs.readFileSync(origFilePath, 'utf8')

      // write file to destination folder
      const writePath = path.join(packagesDir, packageName, file)

      fs.writeFileSync(writePath, ejs.render(contents, variables), 'utf8');
    } else if (stats.isDirectory()) {
      // create folder in destination folder
      fs.mkdirSync(path.join(packagesDir, packageName, file))

      // copy files/folder inside current folder recursively
      createDirectoryContents(path.join(templatePath, file), path.join(packageName, file))
    }
  })
}

inquirer
  .prompt(QUESTIONS)
  .then(answers => {
    const template = answers['template']
    const name = answers['name']
    const templatePath = path.join(templatesDir, template)
    const tartgetPath = path.join(packagesDir, name)
    const variables = { packageName: name, importName: toCamelCase(name) }

    console.log({ name, template, templatePath, tartgetPath, variables })

    if (!createProject(tartgetPath)) return

    createDirectoryContents(templatePath, name, variables)
  })
