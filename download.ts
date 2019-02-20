import { downloadBinary, binName } from './utils'
;(async () => {
  const from = `https://github.com/Akumzy/go-watcher/${binName}`
  console.log('Download binary.....!')
  await downloadBinary(from)
  console.log('Download completed!')
})()
