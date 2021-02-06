const ShortenedLink = require('./shortened-link');

/**
 * Root URL to this application
 * @type {String}
 */
const APPLICATION_ROOT_URL = 'https://lnkto.in/';

/**
 * Human-readable transcriptions of errors
 * @type {Object.<String, String>}
 */
const ErrorTranscriptions = {
  EINCORRECT: 'Incorrect URL provided',
  ERESTRICTED: 'Shortening of this URL is restricted due to security reasons',
  ENOTFOUND: 'URL is not found'
};

module.exports.handler = async (event) => {
  // Resolving of shortened link
  if (event.path === '/{linkId}') {
    // Check shortening identifier correctness
    if (typeof event.params.linkId !== 'string' || event.params.linkId.length !== 6) {
      return {
        statusCode: 400,
        body: {
          success: false,
          errorCode: 'EINCORRECT',
          errorMessage: ErrorTranscriptions.EINCORRECT,
        }
      };
    }
    // Obtaining origin from the database
    const origin = await ShortenedLink.findById(event.params.linkId);
    if (origin) { return { statusCode: 301, headers: { Location: origin } }; }
    return {
      statusCode: 404,
      body: {
        success: false,
        errorCode: 'ENOTFOUND',
        errorMessage: ErrorTranscriptions.ENOTFOUND
      }
    };
  }

  // Shortening link
  if (event.path === '/' && event.httpMethod === 'POST') {
    // I don't know why, but for some reason, YCF does not decode request body by itself
    // So we will do this manually there
    let body = null;
    try {
      body = JSON.parse(event.body);
    } catch (err) {
      return {
        statusCode: 400,
        body: {
          success: false,
          errorCode: 'EINCORRECT',
          errorMessage: ErrorTranscriptions.EINCORRECT,
        }
      };
    }

    // Validating URL in body
    const originValid = ShortenedLink.isValid(body.url);
    if (!originValid.eligible) {
      return {
        statusCode: 400,
        body: {
          success: false,
          errorCode: originValid.error,
          errorMessage: ErrorTranscriptions[originValid.error]
        }
      };
    }
    // Shortening URL
    const shortenId = await ShortenedLink.save(body.url);
    return {
      statusCode: 201,
      body: {
        success: true,
        url: APPLICATION_ROOT_URL.concat(shortenId)
      }
    };
  }
};
