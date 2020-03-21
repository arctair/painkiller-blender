const cp = require('child_process');
const promisify = require('util').promisify
const exec = promisify(cp.exec);


const childToPromise = child => new Promise((resolve, reject) => {
  const stdout = [];
  const stderr = []
  child.stdout.setEncoding('utf8')
  child.stdout.on('data', data => stdout.push(data))
  child.stderr.setEncoding('utf8')
  child.stderr.on('data', data => stderr.push(data))
  child.addListener('error', () => reject({ stderr, stdout }));
  child.addListener('exit', () => resolve({ stderr, stdout }));
});

const generate = async ({
  cutline,
  extent,
  id,
  imgPaths,
  size
}) => {
  await exec([
    'gdalbuildvrt',
    '-overwrite',
    `/tmp/${id}-elevation.vrt`,
    ...imgPaths,
  ].join(' '))
  const child = cp.spawn(
    'python',
    ['src/app/heightmap.py'],
  )
  child.stdin.write(
    JSON.stringify({
      cutline,
      extent,
      inRaster: `/tmp/${id}-elevation.vrt`,
      outRaster: `/tmp/${id}-heightmap.tif`,
      size,
    }),
  );
  child.stdin.end();
  try {
    await childToPromise(child);
  } catch ({ stdout, stderr }) {
    throw Error(`Failed to render heightmap for id ${id}\nstdout: ${stdout}\nstderr: ${stderr}`);
  }
}

module.exports = { generate };