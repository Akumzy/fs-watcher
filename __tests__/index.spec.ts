import Watcher, { WatcherOption } from '../'
const dirFiles = ['/home/akumzy/projects/watcher/__tests__', '/home/akumzy/projects/watcher/__tests__/index.spec.ts']
describe('watcher', () => {
  const w = new Watcher({
    path: __dirname,
    interval: 100,
    ignoreHiddenFiles: true
  } as WatcherOption)
  it('start', async () => {
    let files = await w.start()
    expect(files.map(e => e.path)).toEqual(dirFiles)
  })

  test('getWatchedFiles', async () => {
    let files = await w.getWatchedFiles()
    expect(files.map(e => e.path)).toEqual(dirFiles)
  }, 10000)
})
