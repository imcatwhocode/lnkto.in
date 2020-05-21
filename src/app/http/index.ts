import Debug from 'debug';
import fastify, { FastifyInstance } from 'fastify';

/**
 * Represent an Fastify HTTP server as BootstrapableEntity
 * @implements {BootstrapableEntity}
 */
class HTTP implements BootstrapableEntity {

  /**
   * Fastify application instance
   */
  private readonly app: FastifyInstance = fastify();

  /**
   * Local debugger instance
   */
  private readonly debug = Debug('lnkto:http');

  /**
   * Connection string (represents networking layer connection scheme)
   */
  public readonly connstring: string = process.env.HTTP_IPC_BIND || (`${process.env.HTTP_BIND_HOST || '127.0.0.1'}:${process.env.HTTP_BIND_PORT || 3000}`)

  /**
   * Spins up a Fastify application2
   * @async
   */
  async up(): Promise<void> {

    return new Promise((resolve, reject) => {

      const resolver = (err: Error|undefined): void => {

        if (err)
          return reject(err);

        this.debug('listening on %s', this.connstring);
        return resolve();

      };

      // Binding on UDS (Unix Domain Socket)
      if (process.env.HTTP_IPC_BIND)
        return this.app.listen(process.env.HTTP_IPC_BIND, resolver);

      // Binding on TCP
      return this.app.listen(Number(process.env.HTTP_BIND_PORT) || 3000, process.env.HTTP_BIND_HOST || '127.0.0.1', resolver);

    });

  }

  /**
   * Stops the Fastify application gracefully
   * @async
   */
  async down(): Promise<void> {
    return this.app.close();
  }

}

export default new HTTP();
