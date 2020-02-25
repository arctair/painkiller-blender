const fs = require('fs');

typeof describe === 'undefined' || describe('service', function () {
  this.timeout(0)
  const chai = require('chai');
  const crypto = require('crypto');
  const request = require('request-promise');
  chai.should();
  chai.use(require('chai-as-promised'));
  it('should return shaded relief TIFF with predetermined extent', async function () {
    const sha1 = buffer => crypto.createHash('sha1')
      .update(buffer)
      .digest('hex');

    const responseBig = await request({
      encoding: null,
      json: {
        width: 256,
        height: 256,
      },
      method: 'POST',
      resolveWithFullResponse: true,
      uri: 'http://localhost:8080',
    });
    responseBig.headers['content-type'].should.contain('image/tiff');
    sha1(responseBig.body).should.equal(sha1(fs.readFileSync('./assets/shaded-relief.tif')));

    const responseSmall = await request({
      encoding: null,
      json: {
        width: 128,
        height: 128,
      },
      method: 'POST',
      resolveWithFullResponse: true,
      uri: 'http://localhost:8080',
    });
    responseSmall.headers['content-type'].should.contain('image/tiff');
    sha1(responseSmall.body).should.equal(sha1(fs.readFileSync('./assets/shaded-relief-small.tif')));
  });
  after(function () {
    server.close();
  });
});

const bodyParser = require('body-parser');
const cp = require('child_process');

const app = require('express')();
app.use(bodyParser.json());
app.post('/', (request, response) => {
  const { width, height } = request.body;
  cp.execSync(`python src/translate.py assets/USGS_NED_13_n38w106_IMG.img /tmp/translate.tif ${width} ${height}`, { stdio: 'inherit' });
  cp.execSync(`blender -b -P src/render.py -noaudio -o ///tmp/shaded-relief-#.tif -f 0 -- ${width} ${height} 2.0`, { stdio: 'inherit' });

  response.header('content-type', 'image/tiff');
  response.send(fs.readFileSync('/tmp/shaded-relief-0.tif'));
});
const server = app.listen(8080, () => console.log('0.0.0.0:8080'));