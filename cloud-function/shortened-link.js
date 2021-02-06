const { randomBytes } = require('crypto');
const { DocAPIService } = require('yandex-cloud/lib/slydb/docapi/docapi.js');

const documentApi = new DocAPIService(process.env.DOCUMENT_API_ENDPOINT);

/**
 * Alphabet (based on "z-base-32")
 * @type {Array.<String>}
 */
const CHARSET = '3spn1ckhiznjdpfaqm7ym9oy8h3uuoixc67y49xrhywoadx9iojezzmbr8gq1u8eknbset4g6sp6t4h5rse567fbwk9cr3jnk5b47iacpdqtjfd3gz1tuwfq5m1gw8xa3spn1ckhiznjdpfaqm7ym9oy8h3uuoixc67y49xrhywoadx9iojezzmbr8gq1u8eknbset4g6sp6t4h5rse567fbwk9cr3jnk5b47iacpdqtjfd3gz1tuwfq5m1gw8xa';

/**
 * Shortened link instance
 * @class
 */
class ShortenedLink {
  /**
   * Generates random identifier
   * @param {Number} [size=6] Identifier length
   * @returns {String} Generated identifier
   */
  static generateId(size = 6) {
    return Array.from(randomBytes(size)).map((rnd) => CHARSET[rnd]).join('');
  }

  /**
   * Validates origin URL
   * @param {String} url Origin URL to be validated
   * @returns {Object} Validation status
   */
  static isValid(url) {
    if (typeof url !== 'string' || url.length === 0) { return { eligible: false, error: 'EINCORRECT' }; }
    try {
      const u = new URL(url);
      if (!['http:', 'https:'].includes(u.protocol)) { return { eligible: false, error: 'ERESTRICTED' }; }
      return { eligible: true };
    } catch (_) {
      return { eligible: false, error: 'EINCORRECT' };
    }
  }

  /**
   * Retrives link by identifier
   * @async
   * @param {String} id Identifier
   * @returns {Promise.<String|null>} Origin link, or null if it is not found
   */
  static async findById(id) {
    const entry = await documentApi.getItem({ TableName: 'urls', Key: { id } });
    if (!entry || !entry.Item) { return null; }
    return entry.Item.origin;
  }

  /**
   * Saves URL into database, returning generated identifier
   * @async
   * @param {String} origin Origin URL
   * @returns {Promise.<String>} Identifier
   */
  static async save(origin) {
    try {
      // Generating a new identifier
      const id = ShortenedLink.generateId();

      // Saving document
      await documentApi.putItem({
        TableName: 'urls',
        ConditionExpression: 'attribute_not_exists(origin)',
        Item: {
          id,
          origin,
        }
      });

      // Return identifier
      return id;
    } catch (err) {
      // Retry recursively if condition expression is failed (i.e., this link id is already exists)
      if (err.code === 'ConditionalCheckFailedException') { return ShortenedLink.save(origin); }

      // Throw error otherwise
      throw err;
    }
  }
}

module.exports = ShortenedLink;
