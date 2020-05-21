interface BootstrapableEntity {

  up: () => Promise<void>;
  down: () => Promise<void>;

}
