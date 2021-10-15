const dotenv = require('dotenv').config()
const fs = require('fs')
const polka = require('polka')
const simpleGit = require('simple-git')

const log = (type, msg) =>
  console.log(
    `[${new Date().toUTCString()}] :: [${type.toUpperCase()}] :: ` + msg
  )

/*
  0 - protocol
  1 - empty ~> can be ignored
  2 - host
  3 - username
  4 - repo name
 */
const parsedRepoUrl = process.env.REPO.split('/')
const repoName = parsedRepoUrl[4].includes('.git')
  ? parsedRepoUrl[4].substr(0, parsedRepoUrl[4].length - 4)
  : parsedRepoUrl[4]
const baseDir = process.cwd() + '/' + repoName

/** @type {import('simple-git').SimpleGit} */
let git
;(async function initGit() {
  const options = {
    baseDir,
    binary: 'git',
    maxConcurrentProcesses: 6,
  }

  try {
    git = simpleGit(options)
  } catch (e) {
    git = simpleGit()
    await git.clone(process.env.REPO)
    git = simpleGit(options)
  }
})()

/*
do some basic sorting here like if its a note, spotify
link or map item and sort if to different files 
*/
async function webhookLogic(req, res) {
  try {
    // TODO: uncomment once IOS gets their shit together
    // if (!req.headers["authorization"] || req.headers["authorization"] !== `Bearer ${process.env.TOKEN}`) return res.end('Unauthorized')
    const { inputs } = req.body
    if (
      inputs.data.includes('spotify.com') ||
      inputs.data.includes('music.apple.com')
    ) {
      log('song', 'New Song has been received')
      // spotify or apple musik link, append to songs file
      fs.appendFileSync(
        baseDir +
          `/${
            process.env.SONGS_FILENAME.includes('.md')
              ? process.env.SONGS_FILENAME
              : process.env.SONGS_FILENAME + '.md'
          }`,
        '\n -' + inputs.data
      )
    } else if (inputs.data.includes('Map Item')) {
      log('map item', 'New Map Item has been received')
      /*
      0 - Name of the map item
      1 - Map item ~> can be ignored
      2 - Link to Map Item
      */
      const splitData = inputs.data.split('\n')
      fs.appendFileSync(
        baseDir +
          `/${
            process.env.MAPITEMS_FILENAME.includes('.md')
              ? process.env.MAPITEMS_FILENAME
              : process.env.MAPITEMS_FILENAME + '.md'
          }`,
        `\n - [${splitData[0]}](${splitData[2]})`
      )
    } else if (inputs.data.includes('[todo]')) {
      log('todo', 'New todo has been received')
      fs.appendFileSync(
        baseDir +
          `/${
            process.env.TODO_FILENAME.includes('.md')
              ? process.env.TODO_FILENAME
              : process.env.TODO_FILENAME + '.md'
          }`,
        '\n -' + inputs.data
      )
    } else {
      log('upload', 'New Upload has been received')
      fs.appendFileSync(
        baseDir +
          `/${
            process.env.UPLOAD_FILENAME.includes('.md')
              ? process.env.UPLOAD_FILENAME
              : process.env.UPLOAD_FILENAME + '.md'
          }`,
        '\n -' + inputs.data
      )
    }

    try {
      await git.pull()
      await git.add('.')
      await git.commit(`File upload: ${new Date()}`)
      await git.push()
    } catch (e) {
      res.end('An error occured while committing to the git repository')
    }
    res.end('Success')
  } catch (e) {
    console.log(e)
    res.end('A general error occured')
  }
}

async function json(req, res, next) {
  const buffers = []
  for await (const chunk of req) { 
    buffers.push(chunk) 
  }
  req.body = JSON.parse(Buffer.concat(buffers).toString())
  next()
}

polka()
  .use(json)
  .post('/', webhookLogic)
  .post('/webhook', webhookLogic)
  .listen(process.env.PORT || 3000, (err) => {
    if (err) throw err
    console.log(`> Listening on http://127.0.0.1:${process.env.PORT || 3000}`)
  })
